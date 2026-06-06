"use client";

import { CheckCircle, Check, X, Lightbulb, Plus, Minus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecommendedAction } from "@/lib/hermes";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResponseOptionsProps {
  options: RecommendedAction[];
  onActionDecision: (id: number, decision: 'approved' | 'declined') => void;
}

export function ResponseOptions({ options, onActionDecision }: ResponseOptionsProps) {
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'declined'>>({});

  const handleDecision = (id: number, decision: 'approved' | 'declined') => {
    setDecisions(prev => ({ ...prev, [id]: decision }));
    onActionDecision(id, decision);
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <CheckCircle size={16} className="text-emerald-500" />
        Recovery Strategies
      </h3>
      <div className="space-y-6">
        {options.map((action) => (
          <div key={action.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-slate-50/50 p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900">{action.title}</span>
                <Badge variant="outline" className={cn(
                  "h-5 px-2 text-[10px] font-bold uppercase",
                  action.priority === 'high' ? "text-red-600 border-red-200 bg-red-50" :
                  action.priority === 'medium' ? "text-amber-600 border-amber-200 bg-amber-50" :
                  "text-blue-600 border-blue-200 bg-blue-50"
                )}>
                  {action.priority} Priority
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {decisions[action.id] === 'approved' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1.5 py-1.5 px-3 rounded-xl">
                    <Check size={14} weight="bold" /> Approved
                  </Badge>
                ) : decisions[action.id] === 'declined' ? (
                  <Badge className="bg-red-100 text-red-700 border-red-200 gap-1.5 py-1.5 px-3 rounded-xl">
                    <X size={14} weight="bold" /> Declined
                  </Badge>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDecision(action.id, 'approved')}
                      className="h-8 px-3 text-xs font-bold rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDecision(action.id, 'declined')}
                      className="h-8 px-3 text-xs font-bold rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {action.summary}
              </p>

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                    <Plus size={14} weight="bold" /> Pros
                  </div>
                  <ul className="space-y-1.5">
                    {action.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/50">
                  <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-[10px] uppercase tracking-wider">
                    <Minus size={14} weight="bold" /> Cons
                  </div>
                  <ul className="space-y-1.5">
                    {action.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Operational Considerations */}
              <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-100/50">
                <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
                  <Lightbulb size={14} weight="bold" /> Operational Considerations
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  {action.operationalConsiderations}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
