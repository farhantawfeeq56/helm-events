"use client";

import { useState } from "react";
import { Message, AssignmentResult } from "@/types/agent";
import { HermesSSEEvent, RecommendedAction } from "@/lib/hermes";

export function useAgent(role: string = "operations") {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string>("");

  async function streamFromHermes(
    message: string,
    onComplete: (payload: Message) => void
  ) {
    const response = await fetch("/api/hermes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, role }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
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

        let event: HermesSSEEvent;
        try {
          event = JSON.parse(raw);
        } catch {
          continue;
        }

        if (event.type === "progress") {
          setStreamStatus(event.content);
        } else if (event.type === "complete") {
          const data = event.payload;
          const msg: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: data.content,
            type: data.type,
            incidentData: data.type === "operational-card" ? data.incidentData : undefined,
            checklist: data.type === "execution-checklist" ? data.checklist : undefined,
            reportData: data.type === "issue-report" ? data.reportData : undefined,
            questions: data.type === "clarification" ? data.questions : undefined,
          };

          // Persist agent-created incidents to localStorage so the detail page can find them
          if (data.type === "operational-card" && data.incidentData) {
            try {
              localStorage.setItem(
                `hermes:incident:${data.incidentData.id}`,
                JSON.stringify(data.incidentData)
              );
            } catch {
              // localStorage unavailable (SSR or private mode)
            }
          }

          onComplete(msg);
          break;
        }
      }
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setStreamStatus("HERMES ONLINE. INITIALIZING...");

    try {
      await streamFromHermes(text, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (error) {
      console.error("Error communicating with Hermes:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "SYSTEM ERROR: CONNECTION FAILED. RETRY INITIATED.",
          type: "text",
        },
      ]);
    } finally {
      setIsTyping(false);
      setStreamStatus("");
    }
  };

  const handleActionDecision = async (actionId: number, decision: "approved" | "modified") => {
    if (decision !== "approved") return;

    // Read the approved action from current message state before any async work
    const currentMessages = messages;
    const incidentMsg = [...currentMessages]
      .reverse()
      .find((m) => m.type === "operational-card" && m.incidentData);
    const approvedAction: RecommendedAction | undefined =
      incidentMsg?.incidentData?.responseOptions?.find((a) => a.id === actionId);

    // 1. Immediately show the checklist in the UI
    setMessages((prev) => {
      const newMessages = [...prev];
      const revIdx = [...newMessages]
        .reverse()
        .findIndex((m) => m.type === "operational-card" && m.incidentData);
      const actualIndex = revIdx !== -1 ? newMessages.length - 1 - revIdx : -1;

      if (actualIndex !== -1 && approvedAction) {
        newMessages[actualIndex] = {
          ...newMessages[actualIndex],
          incidentData: {
            ...newMessages[actualIndex].incidentData!,
            executionStatus: `Executing: ${approvedAction.title}`,
          },
        };
      }

      const checklist: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: `EXECUTION COMMENCED: ${approvedAction?.title.toUpperCase() ?? "ACTION " + actionId}. STATUS TRACKING ACTIVE.`,
        type: "execution-checklist",
        checklist: approvedAction?.steps ?? [{ text: "Executing strategy", status: "in-progress" }],
        // Once assign-plan creates the linked tasks below, the monitor polls
        // this incident for real field progress instead of the static snapshot.
        incidentSlug: incidentMsg?.incidentData?.id,
      };

      return [...newMessages, checklist];
    });

    if (!approvedAction) return;

    // 1b. Persist the decision and dispatch the plan as real, assigned tasks.
    //
    // The approval goes through the SAME endpoint the dedicated incident page
    // uses (`/api/incidents/[id]/approve`). That endpoint marks the chosen
    // option on the incident's `analysis.responseOptions` AND dispatches via the
    // shared engine — so once the operator approves here, the incident page
    // shows only this active response and can't approve a conflicting option.
    // Falls back to a plain dispatch if the incident isn't persisted yet.
    try {
      const slug = incidentMsg?.incidentData?.id;
      type DispatchResult = {
        success?: boolean;
        count?: number;
        dispatched?: number;
        assignments?: Array<{ title: string; assignee: string; reason?: string }>;
      };
      let data: DispatchResult | null = null;

      if (slug) {
        const res = await fetch(`/api/incidents/${encodeURIComponent(slug)}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId: actionId }),
        });
        if (res.ok) data = await res.json();
      }

      // No persisted incident (or the approve call failed): dispatch directly so
      // chat still produces tasks.
      if (!data?.success) {
        const res = await fetch("/api/tasks/assign-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentSlug: slug,
            planTitle: approvedAction.title,
            steps: approvedAction.steps ?? [],
            priority: approvedAction.priority,
          }),
        });
        data = await res.json();
      }

      const count = data?.dispatched ?? data?.count ?? 0;
      if (data?.success && count > 0) {
        const assignments: AssignmentResult[] = Array.isArray(data.assignments)
          ? data.assignments.map((a) => ({
              title: a.title,
              assignee: a.assignee,
              reason: a.reason ?? "",
            }))
          : [];
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 5).toString(),
            role: "agent",
            content: `${count} task${count > 1 ? "s" : ""} dispatched to best-fit responders.`,
            type: "assignment",
            assignments,
          },
        ]);
      }
    } catch {
      // Non-fatal: execution still proceeds even if task creation fails.
    }

    // 2. Call Hermes for live execution confirmation and next steps
    setIsTyping(true);
    setStreamStatus("DEPLOYING EXECUTION PROTOCOL...");

    try {
      const executionPrompt = [
        `EXECUTE APPROVED PLAN: "${approvedAction.title}"`,
        `Summary: ${approvedAction.summary}`,
        `Steps: ${approvedAction.steps?.map((s) => s.text).join("; ") ?? "N/A"}`,
        `Provide execution confirmation, identify any blockers, and specify immediate next actions.`,
      ].join("\n");

      await streamFromHermes(executionPrompt, (msg) => {
        // Tie the Execution Monitor to this incident so it polls real task
        // progress (the dispatched tasks are linked to it) instead of showing a
        // one-time snapshot.
        const enriched: Message =
          msg.type === "execution-checklist"
            ? { ...msg, incidentSlug: incidentMsg?.incidentData?.id }
            : msg;
        setMessages((prev) => [...prev, enriched]);
      });
    } catch (error) {
      console.error("Execution call failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "EXECUTION UPDATE UNAVAILABLE. PROCEED WITH MANUAL CHECKLIST.",
          type: "text",
        },
      ]);
    } finally {
      setIsTyping(false);
      setStreamStatus("");
    }
  };

  const handleGlobalDecision = (type: "escalate" | "resolve") => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content:
        type === "escalate"
          ? "PROTOCOL ESCALATION: OPERATIONS DIRECTOR NOTIFIED. DATA SYNC IN PROGRESS."
          : "INCIDENT RESOLVED. ARCHIVING LOGS AND UPDATING DASHBOARDS.",
      type: "text",
    };
    setMessages((prev) => [...prev, confirmation]);
  };

  return {
    messages,
    isTyping,
    streamStatus,
    handleSendMessage,
    handleActionDecision,
    handleGlobalDecision,
  };
}
