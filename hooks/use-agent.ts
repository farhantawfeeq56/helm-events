"use client";

import { useState } from "react";
import { Message } from "@/types/agent";
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
      };

      return [...newMessages, checklist];
    });

    if (!approvedAction) return;

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
        setMessages((prev) => [...prev, msg]);
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
