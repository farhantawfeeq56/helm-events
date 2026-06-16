import { NextRequest } from "next/server";
import { streamHermesMessage } from "@/lib/hermes-handler";

/**
 * Hermes API — SSE streaming endpoint
 *
 * Proxies the SSE stream from the Python bridge API (or the mock fallback)
 * to the frontend. The client reads `data:` lines:
 *   { type: "progress", content: "..." }  — shown as a status ticker
 *   { type: "complete", payload: HermesResponse }  — final structured response
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

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (data: object) =>
        new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);

      try {
        for await (const event of streamHermesMessage(message, role ?? "operations")) {
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
