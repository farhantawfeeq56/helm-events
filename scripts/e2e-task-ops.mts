/**
 * E2E for task operational workflows + attention feed.
 * Hits the live HTTP routes with a real organizer session cookie, against the
 * real DB. Creates scoped test data on the active event, exercises every action,
 * asserts DB state + activity-history entries, then cleans up after itself.
 *
 * Run:  npm run dev   (terminal 1)
 *       npx tsx scripts/e2e-task-ops.mts   (terminal 2)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

// NB: lib/auth/session captures AUTH_SECRET at module-eval time. It must be
// imported *dynamically* (below, after config() above has populated the env),
// or a static/hoisted import would bind the dev fallback secret and the server
// would reject every token we mint.

const BASE = process.env.E2E_BASE || "http://localhost:3000";
const TAG = "ZZ-E2E-TASKOPS";

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, extra?: unknown) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.error(`  ✗ ${label}`, extra !== undefined ? JSON.stringify(extra) : "");
  }
}

async function main() {
  const { createSessionToken, SESSION_COOKIE } = await import("../lib/auth/session");
  const mongoose = (await import("mongoose")).default;
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const tasks = db.collection("tasks");
  const volunteers = db.collection("volunteers");
  const events = db.collection("events");
  const activities = db.collection("activities");
  const notifications = db.collection("notifications");

  // Active event = most recent by createdAt (mirrors getActiveEvent()).
  const event = await events.find().sort({ createdAt: -1 }).limit(1).next();
  if (!event) throw new Error("No event in DB — seed first.");
  const eventId = event._id;
  console.log(`Active event: ${event.name} (${eventId})`);

  const VOL_A = `${TAG} Vol A`;
  const VOL_B = `${TAG} Vol B`;
  const ORG = `${TAG} Org`;
  const now = Date.now();

  // Purge any leftovers from a prior aborted run so this run starts clean.
  const purge = async () => {
    const leftover = await tasks.find({ title: { $regex: TAG } }).project({ _id: 1 }).toArray();
    for (const t of leftover) {
      await activities.deleteMany({ target: `task:${t._id}` });
      await notifications.deleteMany({ sourceId: String(t._id) });
    }
    await tasks.deleteMany({ title: { $regex: TAG } });
    await volunteers.deleteMany({ fullName: { $regex: TAG } });
  };
  await purge();

  // Scoped volunteers so requireVolunteer() passes for assign/reassign/recover.
  await volunteers.insertMany([
    { eventId, fullName: VOL_A, email: `${TAG}-a@test.local`, status: "Active", role: "General", createdAt: new Date(), updatedAt: new Date(), __v: 0 },
    { eventId, fullName: VOL_B, email: `${TAG}-b@test.local`, status: "Active", role: "General", createdAt: new Date(), updatedAt: new Date(), __v: 0 },
  ]);

  // An active, overdue task assigned to Vol A.
  const ins = await tasks.insertOne({
    eventId,
    title: `${TAG} Task`,
    description: "",
    status: "in-progress",
    priority: "medium",
    assignedTo: VOL_A,
    assignedBy: ORG,
    assignmentReason: "",
    dueAt: new Date(now - 45 * 60_000), // 45m overdue
    blockedReason: "",
    escalationLevel: 0,
    createdAt: new Date(now - 120 * 60_000),
    updatedAt: new Date(now - 120 * 60_000),
    __v: 0,
  });
  const taskId = String(ins.insertedId);
  console.log(`Test task: ${taskId}`);

  // Real organizer session cookie.
  const token = await createSessionToken({ email: `${TAG}@test.local`, role: "organizer", name: `${TAG} Tester` });
  const headers = { "Content-Type": "application/json", Cookie: `${SESSION_COOKIE}=${token}` };
  const action = (body: unknown) =>
    fetch(`${BASE}/api/tasks/${taskId}/action`, { method: "POST", headers, body: JSON.stringify(body) });
  const reload = async () => tasks.findOne({ _id: ins.insertedId });

  // Warm up both routes — in dev, the very first hit triggers on-demand
  // compilation, which can race the middleware and bounce to an HTML page.
  await fetch(`${BASE}/api/tasks/attention`, { headers }).then((r) => r.text()).catch(() => {});
  await action({ action: "__warmup__" }).then((r) => r.text()).catch(() => {});

  // 1. Overdue task should appear in the attention feed before any action.
  {
    const res = await fetch(`${BASE}/api/tasks/attention`, { headers });
    const json = await res.json();
    const ids = (json?.data?.overdue || []).map((t: { _id: string }) => t._id);
    check("attention: overdue feed includes the task", ids.includes(taskId), { ids });
  }

  // 2. Block (volunteer-style report) — requires reason, notifies assignedBy.
  {
    const res = await action({ action: "block", reason: "Vendor hasn't delivered barriers." });
    const json = await res.json();
    check("block: 200 + success", res.status === 200 && json.success === true, json);
    const t = await reload();
    check("block: status=blocked", t?.status === "blocked", t?.status);
    check("block: blockedReason persisted", t?.blockedReason === "Vendor hasn't delivered barriers.", t?.blockedReason);
  }

  // 3. Attention should now bucket it under blocked, not overdue.
  {
    const res = await fetch(`${BASE}/api/tasks/attention`, { headers });
    const json = await res.json();
    const blockedIds = (json?.data?.blocked || []).map((t: { _id: string }) => t._id);
    const overdueIds = (json?.data?.overdue || []).map((t: { _id: string }) => t._id);
    check("attention: now in blocked bucket", blockedIds.includes(taskId), { blockedIds });
    check("attention: no longer in overdue bucket", !overdueIds.includes(taskId), { overdueIds });
  }

  // 4. Recover → back to in-progress, blocker cleared, reassigned to Vol B.
  {
    const res = await action({ action: "recover", assignedTo: VOL_B, note: "Sourced barriers from Hall C." });
    const json = await res.json();
    check("recover: 200 + success", res.status === 200 && json.success === true, json);
    const t = await reload();
    check("recover: status=in-progress", t?.status === "in-progress", t?.status);
    check("recover: blockedReason cleared", !t?.blockedReason, t?.blockedReason);
    check("recover: reassigned to Vol B", t?.assignedTo === VOL_B, t?.assignedTo);
  }

  // 5. Escalate → status escalated, level+1, priority bumped.
  {
    const res = await action({ action: "escalate", reason: "Still slipping; needs a lead." });
    const json = await res.json();
    check("escalate: 200 + success", res.status === 200 && json.success === true, json);
    const t = await reload();
    check("escalate: status=escalated", t?.status === "escalated", t?.status);
    check("escalate: escalationLevel=1", t?.escalationLevel === 1, t?.escalationLevel);
    check("escalate: priority bumped to high", t?.priority === "high", t?.priority);
  }

  // 6. Reassign to an unknown volunteer should be rejected (data integrity).
  {
    const res = await action({ action: "reassign", assignedTo: "Nobody McGhost", reason: "x" });
    check("reassign: unknown volunteer rejected (400)", res.status === 400, res.status);
    const t = await reload();
    check("reassign: assignee unchanged after rejection", t?.assignedTo === VOL_B, t?.assignedTo);
  }

  // 7. Reassign to a real volunteer.
  {
    const res = await action({ action: "reassign", assignedTo: VOL_A, reason: "A is closer." });
    const json = await res.json();
    check("reassign: 200 + success", res.status === 200 && json.success === true, json);
    const t = await reload();
    check("reassign: assignedTo=Vol A", t?.assignedTo === VOL_A, t?.assignedTo);
  }

  // 8. Extend deadline.
  {
    const newDue = new Date(now + 90 * 60_000).toISOString();
    const res = await action({ action: "extend", dueAt: newDue, reason: "Granting runway." });
    const json = await res.json();
    check("extend: 200 + success", res.status === 200 && json.success === true, json);
    const t = await reload();
    check("extend: dueAt updated to future", t?.dueAt && new Date(t.dueAt).getTime() > now, t?.dueAt);
  }

  // 9. Every action wrote a specific entry to the task timeline (target task:<id>).
  {
    const entries = await activities.find({ target: `task:${taskId}` }).toArray();
    const kinds = entries.map((e) => e.action);
    for (const a of ["task_blocked", "task_recovered", "task_escalated", "task_reassigned", "task_deadline_set"]) {
      check(`activity: ${a} logged on task timeline`, kinds.includes(a), kinds);
    }
  }

  // Cleanup — remove only this test's footprint.
  await tasks.deleteOne({ _id: ins.insertedId });
  await volunteers.deleteMany({ fullName: { $in: [VOL_A, VOL_B] } });
  await activities.deleteMany({ target: `task:${taskId}` });
  await notifications.deleteMany({ sourceId: taskId });
  console.log("Cleaned up test data.");

  await mongoose.disconnect();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
