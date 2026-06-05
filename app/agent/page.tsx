"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkle,
  ArrowUp,
  DotsThree,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { mockIncidents } from "@/lib/hermes";
import { useAgent } from "@/hooks/use-agent";
import { MessageItem, TypingIndicator } from "@/components/agent/message-item";
import { IncidentListItem } from "@/components/agent/incident-list-item";
import { operationalActions } from "@/lib/constants";

export default function AgentPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isTyping, 
    handleSendMessage, 
    handleActionDecision, 
    handleGlobalDecision 
  } = useAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const onSend = (text: string) => {
    handleSendMessage(text);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-10">
          {messages.length === 0 ? (
            <div className="flex w-full flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 shadow-sm ring-1 ring-sky-200/50">
                <Sparkle size={32} weight="fill" />
              </div>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Operational Assistant
              </h1>
              <p className="mb-10 text-lg text-slate-600">
                Global Tech Summit 2024 Command Center
              </p>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {operationalActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => onSend(action.message)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 text-left transition-all hover:border-sky-300 hover:bg-white hover:shadow-md hover:shadow-sky-100 group cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-100 group-hover:text-sky-600">
                      <action.icon size={20} />
                    </div>
                    <span className="font-medium text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-12 w-full text-left">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Active Incidents
                  </h2>
                  <Badge variant="outline" className="rounded-lg px-2 py-0 bg-white">
                    {mockIncidents.length} Live
                  </Badge>
                </div>
                <div className="space-y-3">
                  {mockIncidents.map((incident) => (
                    <IncidentListItem 
                      key={incident.id} 
                      incident={incident} 
                      onClick={() => onSend(`Analyze incident: ${incident.title}`)} 
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-10">
              {messages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  message={message} 
                  onActionDecision={handleActionDecision}
                  onGlobalDecision={handleGlobalDecision}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-6 pb-8 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50">
            <Textarea
              placeholder={messages.length === 0 ? "Describe an incident or issue a command..." : "Reply or issue another command..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(input);
                }
              }}
              className="min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <DotsThree size={20} weight="bold" />
                </Button>
              </div>
              <Button
                onClick={() => onSend(input)}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-2xl bg-sky-600 text-white transition-all hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <ArrowUp size={20} weight="bold" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Operational Assistant • Powered by EventOps AI
          </p>
        </div>
      </div>
    </div>
  );
}
