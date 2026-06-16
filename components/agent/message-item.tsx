"use client";

import { Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/agent";
import { OperationalCard } from "./operational-card";
import { ExecutionChecklist } from "./execution-checklist";
import { IssueReportCard } from "./issue-report-card";

interface MessageItemProps {
  message: Message;
  onActionDecision: (actionId: number, decision: 'approved' | 'modified') => void;
  onModifyPlan: (title: string) => void;
  onMyOwnPlan: () => void;
  onGlobalDecision: (type: 'escalate' | 'resolve') => void;
}

export function MessageItem({ message, onActionDecision, onModifyPlan, onMyOwnPlan, onGlobalDecision }: MessageItemProps) {
  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "flex w-full flex-col scroll-mt-10",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      {message.role === "agent" && (
        <div className="mb-2 flex items-center gap-2 ml-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm border border-slate-700">
            <Sparkle size={12} weight="fill" className="text-sky-400" />
          </div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">HERMES.OPS</span>
        </div>
      )}
      
      {message.type === "operational-card" && message.incidentData ? (
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
          <OperationalCard 
            incident={message.incidentData} 
            onActionDecision={onActionDecision}
            onModifyPlan={onModifyPlan}
            onMyOwnPlan={onMyOwnPlan}
            onGlobalDecision={onGlobalDecision}
          />
        </div>
      ) : message.type === "execution-checklist" && message.checklist ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
          <ExecutionChecklist steps={message.checklist} />
        </div>
      ) : message.type === "issue-report" && message.reportData ? (
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
          <IssueReportCard report={message.reportData} />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
            message.role === "user"
              ? "bg-sky-600 text-white font-medium"
              : "bg-white border border-slate-200 text-slate-700 font-medium"
          )}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}

export function TypingIndicator({ status }: { status?: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-2 flex items-center gap-2 ml-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm border border-slate-700">
          <Sparkle size={12} weight="fill" className="text-sky-400" />
        </div>
        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">HERMES.OPS</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400"></div>
        </div>
        {status && (
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 animate-pulse">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
