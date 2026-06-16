"use client";

import { useState } from "react";
import { Message } from "@/types/agent";
import { HermesSSEEvent } from "@/lib/hermes";

export function useAgent(role: string = "operations") {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string>("");

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
      const response = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, role }),
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
            const agentMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "agent",
              content: data.content,
              type: data.type,
              incidentData: data.type === "operational-card" ? data.incidentData : undefined,
              checklist: data.type === "execution-checklist" ? data.checklist : undefined,
              reportData: data.type === "issue-report" ? data.reportData : undefined,
            };
            setMessages((prev) => [...prev, agentMessage]);
            break;
          }
        }
      }
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

  const handleActionDecision = (actionId: number, decision: "approved" | "modified") => {
    if (decision !== "approved") return;

    setMessages((prev) => {
      const newMessages = [...prev];
      const revIdx = [...newMessages]
        .reverse()
        .findIndex((m) => m.type === "operational-card" && m.incidentData);
      const actualIndex = revIdx !== -1 ? newMessages.length - 1 - revIdx : -1;

      let action;
      if (actualIndex !== -1) {
        const incidentMessage = newMessages[actualIndex];
        action = incidentMessage.incidentData?.responseOptions?.find((a) => a.id === actionId);
        if (action) {
          newMessages[actualIndex] = {
            ...incidentMessage,
            incidentData: {
              ...incidentMessage.incidentData!,
              executionStatus: `Executing approved plan: ${action.title}`,
            },
          };
        }
      }

      const confirmation: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: `EXECUTION COMMENCED: ${action?.title.toUpperCase() ?? "ACTION " + actionId}. STATUS TRACKING ACTIVE.`,
        type: "execution-checklist",
        checklist: action?.steps ?? [{ text: "Executing strategy", status: "in-progress" }],
      };

      return [...newMessages, confirmation];
    });
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
