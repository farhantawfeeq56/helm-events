"use client";

import { Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/agent";
import { OperationalCard } from "./operational-card";

interface MessageItemProps {
  message: Message;
  onActionDecision: (actionId: number, decision: 'approved' | 'declined') => void;
  onGlobalDecision: (type: 'escalate' | 'resolve') => void;
}

export function MessageItem({ message, onActionDecision, onGlobalDecision }: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      {message.role === "agent" && (
        <div className="mb-2 flex items-center gap-2 ml-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
            <Sparkle size={12} weight="fill" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assistant</span>
        </div>
      )}
      
      {message.type === "operational-card" && message.incidentData ? (
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1">{message.content}</p>
          <OperationalCard 
            incident={message.incidentData} 
            onActionDecision={onActionDecision}
            onGlobalDecision={onGlobalDecision}
          />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
            message.role === "user"
              ? "bg-sky-600 text-white"
              : "bg-white border border-slate-200 text-slate-700"
          )}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-2 flex items-center gap-2 ml-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
          <Sparkle size={12} weight="fill" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assistant</span>
      </div>
      <div className="flex gap-1.5 rounded-2xl bg-white border border-slate-200 px-4 py-4 shadow-sm">
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"></div>
      </div>
    </div>
  );
}
