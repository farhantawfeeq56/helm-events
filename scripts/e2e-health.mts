/**
 * E2E for the operational health dashboard endpoint.
 * Seeds a scoped event (which becomes the active event), populates it with a
 * realistic mix of incidents / tasks / volunteers / shifts, hits the live
 * /api/operations/health route with a real organizer cookie, asserts the
 * composite health shape + that seeded risks surface, then cleans up.
 *
 * Run:  npm run dev   (terminal 1)
 *       npx tsx scripts/e2e-health.mts   (terminal 2)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

// session.ts captures AUTH_SECRET at eval time — import dynamically after config().
const BASE = process.env.E2E_BASE || "http://localhost:3000";
const TAG = "ZZ-E2E-HEALTH";

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, extra?: unknown) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.error(`  ✗ ${label}`, extra !== undefined ? JSON.stringify(extra) : ""); }
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function todayISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const { createSessionToken, SESSION_COOKIE } = await import("../lib/auth/session");
  const mongoose = (await import("mongoose")).default;
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const events = db.collection("events");
  const incidents = db.collection("incidents");
  const tasks = db.collection("tasks");
  const volunteers = db.collection("volunteers");
  const shifts = db.collection("shifts");

  // Purge leftovers from any prior aborted run.
  const purge = async () => {
    const evs = await events.find({ name: { $regex: TAG } }).project({ _id: 1 }).toArray();
    const ids = evs.map((e) => e._id);
    if (ids.length) {
      for (const c of [incidents, tasks, volunteers, shifts]) await c.deleteMany({ eventId: { $in: ids } });
      await events.deleteMany({ _id: { $in: ids } });
    }
  };
  await purge();

  const now = Date.now();
  const nowD = new Date();
  const oid = new mongoose.Types.ObjectId();
  await events.insertOne({ _id: oid, name: `${TAG} Event`, venue: "Test Hall", city: "Testville", status: "active", createdAt: new Date(), updatedAt: new Date(), __v: 0 });
  console.log(`Scoped active event: ${oid}`);

  const VOL_A = `${TAG} Vol A`;
  const VOL_B = `${TAG} Vol B`;
  await volunteers.insertMany([
    { eventId: oid, fullName: VOL_A, email: `${TAG}-a@t.local`, role: "General", status: "Active", createdAt: nowD, updatedAt: nowD, __v: 0 },
    { eventId: oid, fullName: VOL_B, email: `${TAG}-b@t.local`, role: "General", status: "Active", createdAt: nowD, updatedAt: nowD, __v: 0 },
  ]);

  // Vol A on duty now (shift window spans now).
  await shifts.insertOne({
    eventId: oid, assignedTo: VOL_A, date: todayISO(nowD),
    startTime: hhmm(new Date(now - 60 * 60_000)), endTime: hhmm(new Date(now + 60 * 60_000)),
    status: "scheduled", createdAt: nowD, updatedAt: nowD, __v: 0,
  });

  const mkTask = (o: Record<string, unknown>) => ({
    eventId: oid, title: `${TAG} ${o.title}`, description: "", priority: "medium",
    assignedBy: `${TAG} Org`, assignmentReason: "", blockedReason: "", escalationLevel: 0,
    createdAt: new Date(now - 120 * 60_000), updatedAt: new Date(now - 120 * 60_000), __v: 0, ...o,
  });
  await tasks.insertMany([
    mkTask({ title: "done1", status: "completed", assignedTo: VOL_A, updatedAt: new Date(now - 80 * 60_000) }),
    mkTask({ title: "done2", status: "completed", assignedTo: VOL_A, updatedAt: new Date(now - 70 * 60_000) }),
    mkTask({ title: "wip", status: "in-progress", assignedTo: VOL_A, dueAt: new Date(now + 90 * 60_000) }),
    mkTask({ title: "unassigned", status: "open" }),
    mkTask({ title: "blocked", status: "blocked", assignedTo: VOL_A, blockedReason: "Vendor delay" }),
    mkTask({ title: "escalated", status: "escalated", assignedTo: VOL_B, priority: "high", escalationLevel: 1 }),
    mkTask({ title: "overdue", status: "in-progress", assignedTo: VOL_B, dueAt: new Date(now - 40 * 60_000) }),
  ]);

  await incidents.insertMany([
    { eventId: oid, type: "Security", title: `${TAG} Critical breach`, severity: "critical", description: "x", status: "open", source: "manual", reportedAt: new Date(now - 25 * 60_000), acknowledgedBy: [], createdAt: new Date(now - 25 * 60_000), updatedAt: new Date(now - 25 * 60_000), __v: 0 },
    { eventId: oid, type: "Crowd Flow", title: `${TAG} High congestion`, severity: "high", description: "x", status: "investigating", source: "hermes", reportedAt: new Date(now - 50 * 60_000), acknowledgedBy: [{ name: VOL_A, role: "volunteer", at: new Date(now - 45 * 60_000) }], createdAt: new Date(now - 50 * 60_000), updatedAt: new Date(now - 10 * 60_000), __v: 0 },
    { eventId: oid, type: "Medical", title: `${TAG} Resolved faint`, severity: "medium", description: "x", status: "resolved", source: "manual", reportedAt: new Date(now - 120 * 60_000), acknowledgedBy: [{ name: VOL_B, role: "volunteer", at: new Date(now - 110 * 60_000) }], createdAt: new Date(now - 120 * 60_000), updatedAt: new Date(now - 90 * 60_000), __v: 0 },
  ]);

  const token = await createSessionToken({ email: `${TAG}@t.local`, role: "organizer", name: `${TAG} Tester` });
  const headers = { Cookie: `${SESSION_COOKIE}=${token}` };

  // Warm the route (dev cold-compile can race the middleware).
  await fetch(`${BASE}/api/operations/health`, { headers }).then((r) => r.text()).catch(() => {});

  const res = await fetch(`${BASE}/api/operations/health`, { headers });
  const json = await res.json();
  const h = json.data;
  check("200 + success", res.status === 200 && json.success === true, { status: res.status });
  check("eventName matches scoped event", h?.eventName === `${TAG} Event`, h?.eventName);
  check("hasData true", h?.hasData === true);

  // Score / grade / components
  check("score is 0-100 number", typeof h?.score === "number" && h.score >= 0 && h.score <= 100, h?.score);
  check("grade present", ["A", "B", "C", "D", "F"].includes(h?.grade), h?.grade);
  check("status present", ["Healthy", "Stable", "Strained", "At Risk", "Critical"].includes(h?.status), h?.status);
  check("4 component scores", Array.isArray(h?.components) && h.components.length === 4, h?.components?.length);

  // Incidents
  check("incidents.active >= 2", h?.incidents?.active >= 2, h?.incidents?.active);
  check("incidents.critical >= 1", h?.incidents?.critical >= 1, h?.incidents?.critical);
  check("incidents.unacknowledgedUrgent >= 1", h?.incidents?.unacknowledgedUrgent >= 1, h?.incidents?.unacknowledgedUrgent);
  check("incidents.resolved >= 1", h?.incidents?.resolved >= 1, h?.incidents?.resolved);
  check("incident list sorted critical-first", h?.incidents?.list?.[0]?.severity === "critical", h?.incidents?.list?.[0]?.severity);

  // Tasks
  check("tasks.completed = 2", h?.tasks?.completed === 2, h?.tasks?.completed);
  check("tasks.blocked = 1", h?.tasks?.blocked === 1, h?.tasks?.blocked);
  check("tasks.escalated = 1", h?.tasks?.escalated === 1, h?.tasks?.escalated);
  check("tasks.overdue >= 1", h?.tasks?.overdue >= 1, h?.tasks?.overdue);
  check("tasks.unassigned >= 1", h?.tasks?.unassigned >= 1, h?.tasks?.unassigned);
  check("tasks.atRisk >= 3 (overdue+blocked+escalated)", h?.tasks?.atRisk >= 3, h?.tasks?.atRisk);

  // Workforce
  check("workforce.onShiftNow >= 1", h?.workforce?.onShiftNow >= 1, h?.workforce?.onShiftNow);
  check("workforce.load lists volunteers with work", Array.isArray(h?.workforce?.load) && h.workforce.load.length >= 2, h?.workforce?.load?.length);
  check("workforce.unassignedActiveTasks >= 1", h?.workforce?.unassignedActiveTasks >= 1, h?.workforce?.unassignedActiveTasks);

  // Response
  check("response.taskCompletionRate is number", typeof h?.response?.taskCompletionRate === "number", h?.response?.taskCompletionRate);
  check("response.acknowledgedRate is number", typeof h?.response?.acknowledgedRate === "number", h?.response?.acknowledgedRate);
  check("response.mttrMins > 0 (one resolved)", h?.response?.mttrMins > 0, h?.response?.mttrMins);

  // Attention synthesis
  const cats = (h?.attention || []).map((a: { id: string }) => a.id);
  check("attention: a critical incident item", cats.some((c: string) => c.startsWith("inc-")), cats);
  check("attention: escalated tasks", cats.includes("task-escalated"), cats);
  check("attention: blocked tasks", cats.includes("task-blocked"), cats);
  check("attention: overdue tasks", cats.includes("task-overdue"), cats);
  check("attention: unassigned tasks", cats.includes("task-unassigned"), cats);
  check("attention sorted by severity (critical first)", h?.attention?.[0]?.severity === "critical", h?.attention?.[0]?.severity);
  check("attentionTotal matches list length", h?.attentionTotal === h?.attention?.length, { total: h?.attentionTotal, len: h?.attention?.length });

  // Cleanup
  for (const c of [incidents, tasks, volunteers, shifts]) await c.deleteMany({ eventId: oid });
  await events.deleteOne({ _id: oid });
  console.log("Cleaned up scoped event + data.");

  await mongoose.disconnect();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
