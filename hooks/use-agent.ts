"use client";

import { useState } from "react";
import { Message } from "@/types/agent";

export function useAgent() {
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
        body: JSON.stringify({ message: text }),
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
        incidentData: data.incidentData,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error communicating with Hermes:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "I'm sorry, I'm having trouble connecting to my systems right now. Please try again in a moment.",
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionDecision = (actionId: number, decision: 'approved' | 'modified') => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: `Action ${decision === 'approved' ? 'approved' : 'modified'}. Execution Begins.`,
      type: "text",
    };
    setMessages(prev => [...prev, confirmation]);
  };

  const handleCustomPlan = (plan: string) => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: `Custom plan accepted: "${plan}". Execution Begins.`,
      type: "text",
    };
    setMessages(prev => [...prev, confirmation]);
  };

  const handleGlobalDecision = (type: 'escalate' | 'resolve') => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: type === 'escalate' 
        ? "Incident escalated to the Operations Director. They will be notified immediately."
        : "Incident marked as resolved. Finalizing report and updating status across all dashboards.",
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
