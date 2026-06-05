"use client";

import { CheckCircle, Check, X } from "@phosphor-icons/react";
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
        Response Options
      </h3>
      <div className="space-y-3">
        {options.map((action) => (
          <div key={action.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{action.action}</span>
                <Badge variant="outline" className={cn(
                  "h-4 px-1.5 text-[9px] font-bold uppercase",
                  action.priority === 'high' ? "text-red-500 border-red-100 bg-red-50" :
                  action.priority === 'medium' ? "text-amber-500 border-amber-100 bg-amber-50" :
                  "text-blue-500 border-blue-100 bg-blue-50"
                )}>
                  {action.priority}
                </Badge>
              </div>
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
                    className="h-9 px-4 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDecision(action.id, 'declined')}
                    className="h-9 px-4 rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
