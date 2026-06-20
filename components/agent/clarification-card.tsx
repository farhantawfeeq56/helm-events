"use client";

import { Question, ArrowBendDownRight } from "@phosphor-icons/react";

interface ClarificationCardProps {
  content: string;
  questions: string[];
  onQuickReply: (text: string) => void;
}

/**
 * Rendered when Hermes is unsure about a vague/contextless request. Shows the
 * agent's note plus the specific questions it needs answered, each as a
 * clickable chip that drops the question into the composer so the operator can
 * answer inline. Hermes does not act until the ambiguity is resolved.
 */
export function ClarificationCard({ content, questions, onQuickReply }: ClarificationCardProps) {
  return (
    <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-amber-100/60 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
        <Question size={16} weight="bold" className="text-amber-600" />
        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
          Needs Clarification
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-medium text-amber-900 leading-snug">{content}</p>
      </div>

      {questions.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {questions.map((q, index) => (
            <button
              key={index}
              onClick={() => onQuickReply(q)}
              className="group flex w-full items-start gap-2.5 rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-left transition-all hover:border-amber-400 hover:bg-amber-50"
            >
              <ArrowBendDownRight
                size={14}
                weight="bold"
                className="mt-0.5 shrink-0 text-amber-400 group-hover:text-amber-600"
              />
              <span className="text-[13px] font-medium text-slate-700 group-hover:text-amber-900">
                {q}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-amber-100/40 px-4 py-2.5 border-t border-amber-200">
        <span className="text-[10px] font-medium text-amber-600/80 uppercase tracking-tight">
          Tap a question to answer it — Hermes will proceed once it&apos;s clear
        </span>
      </div>
    </div>
  );
}
