/**
 * Intelligent task assignment.
 *
 * Replaces naive round-robin: given an approved plan step and the pool of the
 * event's volunteers, this scores every candidate against the work to be done
 * and the live operational picture, then picks the most appropriate person and
 * explains *why* in plain language.
 *
 * Signals used (all from real event data):
 *   - Skill fit      — the volunteer's role vs. the domain the task implies
 *   - Availability   — whether they're on the shift covering the current hour
 *   - Readiness      — their roster status (Active / Pending / Inactive)
 *   - Workload       — how many active tasks they already hold (load-balancing)
 *
 * The function is pure and framework-agnostic so it can be unit-tested and
 * reused outside the Next.js route.
 */

export interface AssignmentCandidate {
  fullName: string;
  role?: string;
  shift?: string;
  status?: string;
  /** Active tasks already on this person — mutated across a batch to balance load. */
  openTaskCount: number;
  /**
   * Whether this person has a real, MongoDB-backed shift covering right now.
   * When provided it takes precedence over the `shift` label heuristic;
   * `undefined` means "no shift data — fall back to the roster label".
   */
  onShiftNow?: boolean;
}

export interface AssignmentContext {
  taskText: string;
  planTitle?: string;
  incidentTitle?: string;
  priority: "low" | "medium" | "high";
  /** Injectable for testing; defaults to now. */
  now?: Date;
}

export interface AssignmentResult {
  candidate: AssignmentCandidate | null;
  score: number;
  reason: string;
  /** Human label of the detected work domain, or null if generic. */
  domainLabel: string | null;
}

interface DomainRule {
  domain: string;
  label: string;
  taskKeywords: string[];
  roleKeywords: string[];
}

/**
 * Operational domains, ordered by safety-criticality. Each maps task language
 * to the volunteer roles best equipped to handle it.
 */
const DOMAIN_RULES: DomainRule[] = [
  {
    domain: "safety",
    label: "safety & crowd-control",
    taskKeywords: ["cordon", "secure", "evacuat", "crowd", "barrier", "barricade", "isolat", "lockdown", "perimeter", "access control", "guard", "safety", "fire", "alarm", "threat", "hazard", "leak", "spill", "emergency", "clear the area"],
    roleKeywords: ["security", "safety", "guard", "marshal", "steward", "crowd"],
  },
  {
    domain: "medical",
    label: "medical & first-aid",
    taskKeywords: ["medical", "injur", "first aid", "first-aid", "ambulance", "paramedic", "health", "wound", "casualt", "triage", "cpr", "faint", "sick"],
    roleKeywords: ["medical", "first aid", "first-aid", "health", "nurse", "paramedic", "doctor", "aid"],
  },
  {
    domain: "technical",
    label: "technical / AV",
    taskKeywords: ["av", "audio", "video", "microphone", "mic", "projector", "screen", "stream", "wifi", "wi-fi", "network", "power", "lighting", "sound", "cable", "laptop", "slides", "display"],
    roleKeywords: ["technical", "tech", "av", "a/v", " it", "audio", "video", "sound", "production"],
  },
  {
    domain: "registration",
    label: "registration & check-in",
    taskKeywords: ["registration", "check-in", "check in", "badge", "ticket", "credential", "attendee list", "sign-in", "sign in", "wristband"],
    roleKeywords: ["registration", "check-in", "check in", "front desk", "reception", "badge", "entry"],
  },
  {
    domain: "logistics",
    label: "logistics & supplies",
    taskKeywords: ["supply", "supplies", "equipment", "deliver", "transport", "relocat", "setup", "set up", "teardown", "tear down", "inventory", "logistic", "load", "unload", "signage", "stock"],
    roleKeywords: ["logistic", "operations", "supply", "ops", "setup", "runner", "floor", "facilit"],
  },
  {
    domain: "info",
    label: "guest information & communications",
    taskKeywords: ["notify", "announce", "inform", "communicat", "direct attendees", "information", "guest", "question", "wayfinding", "usher", "direction", "help desk", "point of contact"],
    roleKeywords: ["information", "info", "communication", "guest", "hospitality", "usher", "concierge", "help", "greeter", "ambassador"],
  },
  {
    domain: "hospitality",
    label: "catering & hospitality",
    taskKeywords: ["food", "cater", "water", "refreshment", "meal", "hydrat", "beverage", "snack", "coffee", "lunch", "drinks"],
    roleKeywords: ["catering", "hospitality", "food", "beverage", "refreshment"],
  },
  {
    domain: "program",
    label: "session & stage management",
    taskKeywords: ["session", "speaker", "stage", "panel", "schedule", "reschedul", "moderator", "program", "keynote", "workshop", "room change", "agenda"],
    roleKeywords: ["stage", "session", "program", "coordinator", "moderator", "backstage", "liaison", "emcee"],
  },
];

/**
 * Picks the work domain. The task's own text is the primary signal (weighted
 * heavily); the incident/plan only supply weak context so they can break a tie
 * or classify a generic step, but never override what the task actually says.
 */
function detectDomain(ctx: AssignmentContext): DomainRule | null {
  const taskText = ctx.taskText.toLowerCase();
  const context = `${ctx.incidentTitle ?? ""} ${ctx.planTitle ?? ""}`.toLowerCase();
  let best: DomainRule | null = null;
  let bestScore = 0;
  for (const rule of DOMAIN_RULES) {
    const score = rule.taskKeywords.reduce((n, kw) => {
      if (taskText.includes(kw)) return n + 3; // the task itself
      if (context.includes(kw)) return n + 1; // surrounding incident/plan
      return n;
    }, 0);
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  return best;
}

function roleMatchesDomain(role: string | undefined, rule: DomainRule): boolean {
  if (!role) return false;
  const r = ` ${role.toLowerCase()} `;
  return rule.roleKeywords.some((kw) => r.includes(kw));
}

/** Operational shift covering a given hour of the day. */
export function shiftForHour(hour: number): "Morning" | "Afternoon" | "Evening" {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  return "Evening";
}

function statusReadiness(status: string | undefined): { score: number; label: string } {
  switch ((status || "").toLowerCase()) {
    case "active":
      return { score: 15, label: "Active" };
    case "pending":
      return { score: 4, label: "Pending" };
    case "inactive":
      return { score: -12, label: "Inactive" };
    default:
      return { score: 6, label: "" };
  }
}

function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/**
 * Scores every candidate for one task and returns the best, with a plain-English
 * rationale. Higher score wins; ties break toward the lighter workload.
 */
export function selectAssignee(
  candidates: AssignmentCandidate[],
  ctx: AssignmentContext,
): AssignmentResult {
  if (candidates.length === 0) {
    return { candidate: null, score: 0, reason: "No volunteers are available for this event.", domainLabel: null };
  }

  const domain = detectDomain(ctx);
  const currentShift = shiftForHour((ctx.now ?? new Date()).getHours());
  const minLoad = Math.min(...candidates.map((c) => c.openTaskCount));
  const priorityWeight = ctx.priority === "high" ? 1.5 : ctx.priority === "low" ? 0.6 : 1;

  let best: AssignmentCandidate | null = null;
  let bestScore = -Infinity;

  for (const c of candidates) {
    let score = 0;

    // Skill fit — the dominant signal, amplified for high-priority work.
    if (domain && roleMatchesDomain(c.role, domain)) score += 50 * priorityWeight;

    // Availability — on-shift responders act faster on live tasks. A real shift
    // record covering now wins; otherwise fall back to the roster shift label.
    if (c.onShiftNow === true) score += 25;
    else if (c.onShiftNow === undefined && c.shift && c.shift.toLowerCase().includes(currentShift.toLowerCase())) score += 20;

    // Readiness — roster status.
    score += statusReadiness(c.status).score;

    // Load-balancing — spread work; never pile onto one person.
    score -= c.openTaskCount * 9;

    if (score > bestScore || (score === bestScore && best && c.openTaskCount < best.openTaskCount)) {
      best = c;
      bestScore = score;
    }
  }

  const chosen = best!;
  const reason = buildReason(chosen, ctx, domain, currentShift, minLoad);
  return { candidate: chosen, score: bestScore, reason, domainLabel: domain?.label ?? null };
}

function buildReason(
  c: AssignmentCandidate,
  ctx: AssignmentContext,
  domain: DomainRule | null,
  currentShift: string,
  minLoad: number,
): string {
  const parts: string[] = [];

  const skillMatched = domain && roleMatchesDomain(c.role, domain);
  if (skillMatched) {
    parts.push(`their ${c.role} role is the right fit for this ${domain!.label} task`);
  } else if (domain) {
    // Domain known but no specialist on roster — be honest it's best-available.
    parts.push(`no dedicated ${domain.label} specialist is on the roster, so they're the best-available responder`);
  }

  if (c.onShiftNow === true) {
    parts.push("they're on an active shift right now");
  } else if (c.onShiftNow === undefined && c.shift && c.shift.toLowerCase().includes(currentShift.toLowerCase())) {
    parts.push(`they're on the active ${currentShift} shift`);
  } else if (c.shift) {
    parts.push(`they're rostered for the ${c.shift} shift`);
  }

  const readiness = statusReadiness(c.status).label;
  if (readiness === "Active") parts.push("they're marked Active");

  // Workload — say "lightest" only when it's actually true.
  const load = c.openTaskCount;
  const loadPhrase =
    load === minLoad
      ? `they carry the lightest workload (${load} active task${load === 1 ? "" : "s"})`
      : `they currently hold ${load} active task${load === 1 ? "" : "s"}`;
  parts.push(loadPhrase);

  const lead = skillMatched ? "Matched on skills" : domain ? "Assigned" : "Best available responder";
  return `${lead}: ${joinWithAnd(parts)}.`;
}
