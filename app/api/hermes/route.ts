import { NextRequest } from "next/server";
import { streamHermesMessage } from "@/lib/hermes-handler";
import { getActiveEventContext } from "@/lib/context/contextService";
import { persistHermesIncident } from "@/lib/repositories/incident-repository";

/**
 * Hermes API — SSE streaming endpoint
 *
 * Proxies the SSE stream from the Python bridge API (or the mock fallback)
 * to the frontend. The client reads `data:` lines:
 *   { type: "progress", content: "..." }  — shown as a status ticker
 *   { type: "complete", payload: HermesResponse }  — final structured response
 *
 * On the way in, real event data from MongoDB is injected as context so the
 * agent reasons over the live schedule. On the way out, any incident the agent
 * produces is persisted to MongoDB so it appears in the incidents dashboard.
 */
export async function POST(req: NextRequest) {
  const { message, role } = await req.json();

  if (!message) {
    const errorEvent = `data: ${JSON.stringify({ type: "complete", payload: { type: "text", content: "No message provided." } })}\n\n`;
    return new Response(errorEvent, {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // Pull live event context (best-effort — null if no event / DB unavailable).
  const context = await getActiveEventContext();

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (data: object) =>
        new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);

      try {
        for await (const event of streamHermesMessage(message, role ?? "operations", context)) {
          // Persist agent-created incidents so they surface in the dashboard.
          if (event.type === "complete" && event.payload.type === "operational-card") {
            await persistHermesIncident(event.payload.incidentData);
          }
          controller.enqueue(encode(event));
          if (event.type === "complete") break;
        }
      } catch (err) {
        console.error("Hermes stream error:", err);
        controller.enqueue(
          encode({
            type: "complete",
            payload: { type: "text", content: "SYSTEM ERROR: CONNECTION FAILED. RETRY INITIATED." },
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
