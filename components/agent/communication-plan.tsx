"use client";

import { ChatText, PaperPlaneTilt, Broadcast, Envelope, Mobile } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunicationPlan as CommunicationPlanType } from "@/lib/hermes";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CommunicationPlanProps {
  communications: CommunicationPlanType[];
}

export function CommunicationPlan({ communications }: CommunicationPlanProps) {
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());

  const handleSend = (id: number) => {
    setSentIds(prev => new Set(prev).add(id));
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "SMS": return <Mobile size={16} />;
      case "Push": return <ChatText size={16} />;
      case "Email": return <Envelope size={16} />;
      case "Radio": return <Broadcast size={16} />;
      default: return <PaperPlaneTilt size={16} />;
    }
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <PaperPlaneTilt size={16} className="text-blue-500" />
        Communications
      </h3>
      <div className="space-y-3">
        {communications.map((comm) => (
          <div key={comm.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  {getChannelIcon(comm.channel)}
                </div>
                <span className="text-xs font-bold text-slate-900">{comm.channel} to {comm.audience}</span>
              </div>
              {sentIds.has(comm.id) ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Sent</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 border-slate-200">Draft</Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 italic">
              "{comm.message}"
            </p>
            {!sentIds.has(comm.id) && (
              <Button 
                size="sm" 
                onClick={() => handleSend(comm.id)}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                Send Notification
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
