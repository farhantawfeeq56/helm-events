"use client";

import { useState } from "react";
import { Message } from "@/types/agent";

export function useAgent(role: string = "operations") {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

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

    try {
      const response = await fetch("/api/hermes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text, role }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from Hermes API");
      }

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.content,
        type: data.type,
        incidentData: data.type === "operational-card" ? data.incidentData : undefined,
        checklist: data.type === "execution-checklist" ? data.checklist : undefined,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error communicating with Hermes:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "SYSTEM ERROR: CONNECTION FAILED. RETRY INITIATED.",
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionDecision = (actionId: number, decision: 'approved' | 'modified') => {
    if (decision !== 'approved') return;

    setMessages(prev => {
      const newMessages = [...prev];
      const incidentMessageIndex = [...newMessages].reverse().findIndex(m => m.type === "operational-card" && m.incidentData);
      const actualIndex = incidentMessageIndex !== -1 ? newMessages.length - 1 - incidentMessageIndex : -1;
      
      let action;
      if (actualIndex !== -1) {
        const incidentMessage = newMessages[actualIndex];
        action = incidentMessage.incidentData?.responseOptions?.find(a => a.id === actionId);
        
        if (action) {
          newMessages[actualIndex] = {
            ...incidentMessage,
            incidentData: {
              ...incidentMessage.incidentData!,
              executionStatus: `Executing approved plan: ${action.title}`
            }
          };
        }
      }

      const confirmation: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: `EXECUTION COMMENCED: ${action?.title.toUpperCase() || 'ACTION ' + actionId}. STATUS TRACKING ACTIVE.`,
        type: "execution-checklist",
        checklist: action?.steps || [{ text: "Executing strategy", status: "in-progress" }]
      };

      return [...newMessages, confirmation];
    });
  };

  const handleGlobalDecision = (type: 'escalate' | 'resolve') => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: type === 'escalate' 
        ? "PROTOCOL ESCALATION: OPERATIONS DIRECTOR NOTIFIED. DATA SYNC IN PROGRESS."
        : "INCIDENT RESOLVED. ARCHIVING LOGS AND UPDATING DASHBOARDS.",
      type: "text",
    };
    setMessages(prev => [...prev, confirmation]);
  };

  return {
    messages,
    isTyping,
    handleSendMessage,
    handleActionDecision,
    handleGlobalDecision,
  };
}
