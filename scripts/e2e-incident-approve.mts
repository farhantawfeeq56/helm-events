/**
 * E2E for incident approval + live execution + DB-derived repository.
 * Exercises the real HTTP routes with an organizer session cookie against the
 * real DB: approves a response option, asserts the option flips to approved,
 * tasks are dispatched + linked, the execution endpoint reflects live progress,
 * and the repository derives timeline/risks from real records (no fabrication).
 * Creates scoped test data, asserts, then cleans up after itself.
 *
 * Run:  npm run dev   (terminal 1)
 *       npx tsx scripts/e2e-incident-approve.mts   (terminal 2)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

// lib/auth/session captures AUTH_SECRET at module-eval time — import it
// *dynamically* (after config() above) or a hoisted import binds the dev
// fallback secret and the server rejects every token we mint.

const BASE = process.env.E2E_BASE || "http://localhost:3000";
const TAG = "ZZ-E2E-APPROVE";

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
  const { sanitizeAgentText } = await import("../lib/hermes");
  const mongoose = (await import("mongoose")).default;
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const incidents = db.collection("incidents");
  const tasks = db.collection("tasks");
  const volunteers = db.collection("volunteers");
  const events = db.collection("events");
  const activities = db.collection("activities");

  const event = await events.find().sort({ createdAt: -1 }).limit(1).next();
  if (!event) throw new Error("No event in DB — seed first.");
  const eventId = event._id;
  console.log(`Active event: ${event.name} (${eventId})`);

  const slug = `${TAG.toLowerCase()}-${Date.now()}`;
  const VOL_A = `${TAG} Vol A`;
  const VOL_B = `${TAG} Vol B`;

  // ── Pure-function sanity (W1): raw JSON / fences never leak as text ──────
  check(
    "sanitizeAgentText strips a ```json fence and surfaces content",
    sanitizeAgentText('```json\n{"content":"Hello operator"}\n```') === "Hello operator"
  );
  check(
    "sanitizeAgentText returns prose unchanged",
    sanitizeAgentText("Where did you get this info?") === "Where did you get this info?"
  );

  const purge = async () => {
    const leftover = await incidents.find({ slug: { $regex: TAG.toLowerCase() } }).project({ _id: 1 }).toArray();
    for (const inc of leftover) {
      await tasks.deleteMany({ incidentId: inc._id });
    }
    await incidents.deleteMany({ slug: { $regex: TAG.toLowerCase() } });
    await tasks.deleteMany({ title: { $regex: TAG } });
    await volunteers.deleteMany({ fullName: { $regex: TAG } });
    await activities.deleteMany({ target: `incident:${slug}` });
  };
  await purge();

  await volunteers.insertMany([
    { eventId, fullName: VOL_A, email: `${TAG}-a@test.local`, status: "Active", role: "Logistics", createdAt: new Date(), updatedAt: new Date(), __v: 0 },
    { eventId, fullName: VOL_B, email: `${TAG}-b@test.local`, status: "Active", role: "Communications", createdAt: new Date(), updatedAt: new Date(), __v: 0 },
  ]);

  // A Hermes-style incident with a full analysis payload + one response option.
  const analysis = {
    id: slug,
    title: `${TAG} Speaker Delay`,
    severity: "High",
    status: "Investigating",
    timestamp: "just now",
    description: `${TAG} keynote speaker stuck in traffic.`,
    impactAnalysis: ["Main Stage Schedule", "Attendee Flow"],
    responseOptions: [
      {
        id: 1,
        title: "Push keynote back 20 minutes",
        summary: "Shift the Main Stage schedule by 20 minutes.",
        pros: ["Full keynote preserved"],
        cons: ["Lunch shifts later"],
        operationalConsiderations: "Coordinate with catering.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Coordinate with catering for lunch delay", status: "pending" },
          { text: "Update Main Stage AV schedule", status: "pending" },
        ],
      },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Delay may cascade into afternoon sessions.",
      mitigationStrategy: "Tighten transition times.",
    },
    executionStatus: "Awaiting approval.",
    iconName: "Clock",
    color: "amber",
  };

  const insInc = await incidents.insertOne({
    eventId,
    type: analysis.title,
    title: analysis.title,
    slug,
    severity: "high",
    description: analysis.description,
    status: "open",
    source: "hermes",
    analysis,
    reportedAt: new Date(),
    acknowledgedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  });
  const incidentId = insInc.insertedId;
  console.log(`Test incident: ${slug} (${incidentId})`);

  const token = await createSessionToken({ email: `${TAG}@test.local`, role: "organizer", name: `${TAG} Tester` });
  const headers = { "Content-Type": "application/json", Cookie: `${SESSION_COOKIE}=${token}` };

  // Warm up the routes (dev on-demand compile can race middleware on first hit).
  await fetch(`${BASE}/api/incidents/${slug}/execution`, { headers }).then((r) => r.text()).catch(() => {});

  // ── 1. Approve the response option ──────────────────────────────────────
  {
    const res = await fetch(`${BASE}/api/incidents/${slug}/approve`, {
      method: "POST",
      headers,
      body: JSON.stringify({ optionId: 1 }),
    });
    const json = await res.json();
    check("approve: 200 + success", res.status === 200 && json.success === true, json);
    check("approve: decision=approved", json.decision === "approved", json.decision);
    check("approve: dispatched 2 tasks", json.dispatched === 2, json.dispatched);
    check("approve: assignments returned with assignees", Array.isArray(json.assignments) && json.assignments.length === 2, json.assignments);
  }

  // ── 2. Option status persisted to analysis + executionStatus updated ────
  {
    const doc = await incidents.findOne({ _id: incidentId });
    const opt = doc?.analysis?.responseOptions?.find((o: { id: number }) => o.id === 1);
    check("persist: option status=approved in analysis", opt?.status === "approved", opt?.status);
    check("persist: executionStatus updated", typeof doc?.analysis?.executionStatus === "string" && doc.analysis.executionStatus.includes("approved"), doc?.analysis?.executionStatus);
    check("persist: incident status moved off open", (doc?.status || "").toLowerCase() !== "open", doc?.status);
  }

  // ── 3. Tasks created + linked to the incident ───────────────────────────
  {
    const linked = await tasks.find({ incidentId }).toArray();
    check("dispatch: 2 tasks linked to incident", linked.length === 2, linked.length);
    check("dispatch: tasks carry an assignee", linked.every((t) => (t.assignedTo || "").length > 0), linked.map((t) => t.assignedTo));
    check("dispatch: tasks reference the event", linked.every((t) => String(t.eventId) === String(eventId)), linked.map((t) => String(t.eventId)));
  }

  // ── 4. plan_approved logged on the incident timeline ────────────────────
  {
    const entries = await activities.find({ target: `incident:${slug}` }).toArray();
    const kinds = entries.map((e) => e.action);
    check("activity: plan_approved logged with target incident:<slug>", kinds.includes("plan_approved"), kinds);
  }

  // ── 5. Execution endpoint reflects live progress ────────────────────────
  {
    const res = await fetch(`${BASE}/api/incidents/${slug}/execution`, { headers });
    const json = await res.json();
    check("execution: linked=true", json.linked === true, json);
    check("execution: 2 steps", Array.isArray(json.steps) && json.steps.length === 2, json.steps);
    check("execution: 0/2 complete initially", json.completed === 0 && /0\/2/.test(json.executionStatus || ""), json.executionStatus);
  }

  // Complete one linked task, then re-poll — a step should flip to completed.
  {
    const one = await tasks.find({ incidentId }).limit(1).next();
    await tasks.updateOne({ _id: one!._id }, { $set: { status: "completed", updatedAt: new Date() } });
    const res = await fetch(`${BASE}/api/incidents/${slug}/execution`, { headers });
    const json = await res.json();
    const completedSteps = (json.steps || []).filter((s: { status: string }) => s.status === "completed").length;
    check("execution: one step now completed", completedSteps === 1, json.steps);
    check("execution: status reads 1/2 complete", /1\/2/.test(json.executionStatus || ""), json.executionStatus);
  }

  // ── 6. Repository derives real data (timeline from activity, risks from analysis) ──
  {
    const { getIncidentById } = await import("../lib/repositories/incident-repository");
    const inc = await getIncidentById(slug);
    check("repo: incident resolved from DB", !!inc, inc?.id);
    check("repo: timeline derived from activity log (>=1 entry)", (inc?.timeline?.length || 0) >= 1, inc?.timeline?.length);
    check("repo: timeline entry came from plan_approved", (inc?.timeline || []).some((t) => /approved/i.test(t.title) || /approved/i.test(t.description)), inc?.timeline);
    check("repo: risks derived from analysis.riskAssessment", (inc?.risks?.length || 0) === 1, inc?.risks);
    check("repo: no fabricated affectedResources", Array.isArray(inc?.affectedResources) && inc?.affectedResources.length === 0, inc?.affectedResources);
    check("repo: approved option status carried through", (inc?.responseOptions || []).some((o) => o.status === "approved"), inc?.responseOptions?.map((o) => o.status));
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────
  await tasks.deleteMany({ incidentId });
  await incidents.deleteOne({ _id: incidentId });
  await volunteers.deleteMany({ fullName: { $in: [VOL_A, VOL_B] } });
  await activities.deleteMany({ target: `incident:${slug}` });
  console.log("Cleaned up test data.");

  await mongoose.disconnect();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
