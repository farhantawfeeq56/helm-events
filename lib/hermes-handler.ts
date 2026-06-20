/**
 * Hermes Handler
 *
 * Core message-processing logic. Framework-agnostic — used by both the
 * Next.js API route (app/api/hermes/route.ts) and the GCP Cloud Function
 * (bridge-cf/). Do NOT import Next.js or GCP-specific modules here.
 *
 * When HERMES_AGENT_URL is set, requests are forwarded to the Python bridge
 * API running on the remote server (accessible via SSH tunnel on localhost:3001).
 * Without it, the mock keyword-matching fallback is used for development.
 */

import { HermesResponse, HermesSSEEvent, mockIncidents, ReportedIssue, Severity, Incident, sanitizeAgentText } from "./hermes";
import { logActivity } from "./activity-logger";

const HERMES_AGENT_URL = process.env.HERMES_AGENT_URL?.replace(/\/$/, "");

/**
 * Safety net: tries to extract a valid HermesResponse JSON from a raw text payload.
 *
 * The Hermes bridge already parses the agent's JSON into a structured payload —
 * the output contract lives in the agent's trusted AGENTS.md on the server. This
 * only runs as a fallback if a `text`-typed payload still contains JSON (e.g. the
 * agent wrapped it in a code fence). It never alters a legitimate plain-text reply.
 *
 * IMPORTANT: do NOT append formatting instructions to the user message. Doing so
 * makes the agent treat the user input as a prompt-injection attempt and refuse.
 * Output formatting is owned server-side via the agent's AGENTS.md.
 */
function tryParseHermesJSON(raw: string): HermesResponse | null {
  let cleaned = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) cleaned = fence[1].trim();

  // Find the outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const validTypes = ["operational-card", "execution-checklist", "issue-report", "clarification", "text"];
    if (typeof parsed.type === "string" && validTypes.includes(parsed.type) && typeof parsed.content === "string") {
      // A clarification must carry a questions array; coerce a missing one so a
      // well-typed payload still renders rather than falling back to raw text.
      if (parsed.type === "clarification" && !Array.isArray(parsed.questions)) {
        parsed.questions = [];
      }
      return parsed as HermesResponse;
    }
  } catch {
    // not valid JSON
  }
  return null;
}

/**
 * Attaches live event data (from MongoDB, via contextService) to the operator's
 * message so the agent can reason over the real schedule and open incidents.
 *
 * The operator request is kept FIRST and primary; the event data follows as
 * clearly-subordinate background reference. (Leading with a large context blob
 * caused the agent to fixate on it and ignore the actual request — e.g. a fire
 * alarm came back as a generic "readiness status".)
 *
 * This is descriptive DATA, not instructions, so it does not trip the agent's
 * prompt-injection defenses. The output-format contract stays in the agent's
 * trusted AGENTS.md — never appended here.
 */
function buildContextualMessage(message: string, context?: string | null): string {
  if (!context) return message;
  return [
    message,
    "",
    "---",
    "[BACKGROUND — live data for the current event, for reference only.",
    "Respond to the operator request above; use this data only where relevant.]",
    context,
  ].join("\n");
}

// ─── Live agent path (SSE streaming) ────────────────────────────────────────

/**
 * Streams SSE events from the Hermes bridge API.
 * Yields progress ticks then a final `complete` event containing HermesResponse.
 *
 * @param context Optional formatted event data injected ahead of the message.
 */
export async function* streamHermesMessage(
  message: string,
  role: string = "operations",
  context?: string | null
): AsyncGenerator<HermesSSEEvent> {
  if (!HERMES_AGENT_URL) {
    // Fall back to mock — yield a single complete event
    const payload = await processHermesMock(message, role);
    yield { type: "complete", payload };
    return;
  }

  const res = await fetch(`${HERMES_AGENT_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: buildContextualMessage(message, context), role }),
  });

  if (!res.ok || !res.body) {
    yield {
      type: "complete",
      payload: { type: "text", content: `BRIDGE ERROR: HTTP ${res.status}` },
    };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;
      try {
        const event = JSON.parse(raw) as HermesSSEEvent;

        if (event.type === "complete") {
          // If the live agent returned plain text, try to extract structured JSON
          // from it. If it isn't our contract, sanitize so a stray ```json fence
          // or bare JSON object is never shown to the operator as raw text.
          let payload = event.payload;
          if (payload.type === "text") {
            const structured = tryParseHermesJSON(payload.content);
            payload = structured ?? { type: "text", content: sanitizeAgentText(payload.content) };
          }

          await logActivity({
            user: role === "volunteer" ? "Hermes (Volunteer)" : "Hermes",
            type: "agent",
            action: "Response Delivered",
            target: payload.type,
            details: `Message: "${message.substring(0, 60)}${message.length > 60 ? "..." : ""}"`,
          });

          yield { type: "complete", payload };
          return;
        }

        yield event;
      } catch {
        // malformed SSE line — skip
      }
    }
  }
}

/**
 * Non-streaming convenience wrapper. Returns the final HermesResponse.
 * Used by the GCP Cloud Function path which does not support streaming.
 */
export async function processHermesMessage(
  message: string,
  role: string = "operations",
  context?: string | null
): Promise<HermesResponse> {
  if (!HERMES_AGENT_URL) {
    return processHermesMock(message, role);
  }

  const res = await fetch(`${HERMES_AGENT_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: buildContextualMessage(message, context), role }),
  });

  if (!res.ok) {
    return { type: "text", content: `BRIDGE ERROR: HTTP ${res.status}` };
  }

  const payload = (await res.json()) as HermesResponse;
  if (payload.type === "text") {
    return tryParseHermesJSON(payload.content) ?? { type: "text", content: sanitizeAgentText(payload.content) };
  }
  return payload;
}

// ─── Mock fallback (keyword matching, no LLM) ───────────────────────────────

function extractSignals(message: string): string[] {
  const signals: string[] = [];
  const lower = message.toLowerCase();
  if (lower.includes("leak") || lower.includes("water") || lower.includes("fluid")) signals.push("Fluid Leak");
  if (lower.includes("fire") || lower.includes("smoke") || lower.includes("burning")) signals.push("Fire Hazard");
  if (lower.includes("crowd") || lower.includes("packed") || lower.includes("density")) signals.push("Crowd Density");
  if (lower.includes("power") || lower.includes("outlet") || lower.includes("electricity")) signals.push("Power Issue");
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet")) signals.push("Connectivity");
  if (lower.includes("medical") || lower.includes("hurt") || lower.includes("sick") || lower.includes("fainted")) signals.push("Medical Emergency");
  if (lower.includes("broken") || lower.includes("damaged")) signals.push("Equipment Damage");
  return signals;
}

function extractLocation(message: string): string {
  const hallMatch = message.match(/Hall\s+[A-Z0-9]/i);
  const roomMatch = message.match(/Room\s+[A-Z0-9]+/i);
  const boothMatch = message.match(/Booth\s+[A-Z0-9]+/i);
  const stageMatch = message.match(/Stage\s+[A-Z0-9]+/i);
  if (hallMatch) return hallMatch[0];
  if (roomMatch) return roomMatch[0];
  if (boothMatch) return boothMatch[0];
  if (stageMatch) return stageMatch[0];
  return "Current Location/TBD";
}

function categorizeIssue(message: string): ReportedIssue["category"] {
  const lower = message.toLowerCase();
  if (lower.includes("medical") || lower.includes("hurt") || lower.includes("sick")) return "Medical";
  if (lower.includes("security") || lower.includes("fight") || lower.includes("theft") || lower.includes("suspicious")) return "Security";
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("software")) return "Technical";
  if (lower.includes("leak") || lower.includes("light") || lower.includes("broken") || lower.includes("power")) return "Facility";
  if (lower.includes("food") || lower.includes("water") || lower.includes("shuttle") || lower.includes("signage")) return "Logistics";
  return "General";
}

function determineSeverity(message: string): Severity {
  const lower = message.toLowerCase();
  if (lower.includes("urgent") || lower.includes("emergency") || lower.includes("fire") || lower.includes("fainted") || lower.includes("critical")) return "Critical";
  if (lower.includes("broken") || lower.includes("down") || lower.includes("stopped") || lower.includes("high")) return "High";
  if (lower.includes("flickering") || lower.includes("slow") || lower.includes("medium")) return "Medium";
  return "Low";
}

function getEscalationGuidance(category: string): string {
  switch (category) {
    case "Medical": return "Do not move the individual. Stay with them and keep the area clear. Medical team is dispatched.";
    case "Security": return "Maintain a safe distance. Do not intervene. Observe and report details to security personnel via Radio channel 2.";
    case "Facility": return "Mark the area if hazardous (e.g., spills). Redirect attendee flow away from the issue.";
    case "Technical": return "Advise attendees that IT is aware and working on it. Do not attempt to reset venue hardware yourself.";
    case "Logistics": return "Direct attendees to the nearest alternative service point. Operations lead is coordinating a response.";
    default: return "Acknowledge the issue to any concerned attendees. Keep operations informed of any changes.";
  }
}

async function processHermesMock(message: string, role: string): Promise<HermesResponse> {
  const lowerText = message.toLowerCase();

  if (role === "volunteer") {
    const blocked = ["reschedule", "reassign", "cancel", "strategy", "recovery"];
    if (blocked.some((kw) => lowerText.includes(kw))) {
      return {
        type: "text",
        content: "ACCESS RESTRICTED: I am unable to perform operational changes. Please contact your Operations Lead.",
      };
    }
  }

  // Volunteer field report
  const isReporting =
    lowerText.includes("report") ||
    lowerText.includes("issue") ||
    lowerText.includes("seeing") ||
    lowerText.includes("problem") ||
    lowerText.includes("found") ||
    (lowerText.includes("there is a") && !lowerText.includes("?")) ||
    (lowerText.includes("there's a") && !lowerText.includes("?"));

  if (isReporting && role === "volunteer") {
    const category = categorizeIssue(message);
    const severity = determineSeverity(message);
    const location = extractLocation(message);
    const signals = extractSignals(message);
    const guidance = getEscalationGuidance(category);

    const reportData: ReportedIssue = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      description: message,
      location,
      severity,
      extractedSignals: signals,
      guidance,
      status: "Reported",
      timestamp: "Just now",
    };

    await logActivity({
      user: "Hermes (Volunteer)",
      type: "agent",
      action: "Issue Categorized",
      target: reportData.id,
      details: `Structured report generated for ${category} issue at ${location}`,
    });

    return {
      type: "issue-report",
      content: "I have processed your report and extracted the key operational details.",
      reportData,
    };
  }

  await logActivity({
    user: role === "volunteer" ? "Hermes (Volunteer)" : "Hermes",
    type: "agent",
    action: "Processing Query",
    target: "System Intelligence",
    details: `Message: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
  });

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Keyword → incident lookup
  let incidentData: Incident | null = null;
  if (lowerText.includes("delay") || lowerText.includes("speaker")) {
    incidentData = mockIncidents.find((i) => i.id === "speaker-delay") || null;
  } else if (lowerText.includes("internet") || lowerText.includes("wifi") || lowerText.includes("wi-fi")) {
    incidentData = mockIncidents.find((i) => i.id === "internet-outage") || null;
  }

  if (incidentData) {
    await logActivity({
      user: "Hermes",
      type: "agent",
      action: "Incident Analysis",
      target: incidentData.title,
      details: `Generated response options for: ${incidentData.title}`,
    });

    if (role === "volunteer") {
      // Strip ops-only fields from volunteer view
      const { id, title, severity, status, timestamp, description, impactAnalysis, executionStatus, iconName, color } = incidentData;
      const sanitized = { id, title, severity, status, timestamp, description, impactAnalysis, executionStatus, iconName, color } as Incident;
      return {
        type: "operational-card",
        content: `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}.`,
        incidentData: sanitized,
      };
    }

    return {
      type: "operational-card",
      content: `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. RESPONSE OPTIONS GENERATED.`,
      incidentData,
    };
  }

  if (lowerText.includes("deploy") || lowerText.includes("execute")) {
    return {
      type: "execution-checklist",
      content: "EXECUTION COMMENCED. TRACKING OPERATIONAL STEPS.",
      checklist: [
        { text: "Notify relevant department", status: "completed" },
        { text: "Allocate resources", status: "in-progress" },
        { text: "Confirm resolution", status: "pending" },
      ],
    };
  }

  return { type: "text", content: "NO MATCHING INCIDENT FOUND. AWAITING COMMAND." };
}
