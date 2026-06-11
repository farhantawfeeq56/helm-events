"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CaretRight, XCircle, Timer, Prohibit } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TaskStatus = "open" | "in-progress" | "completed" | "blocked" | "cancelled";

interface StatusTransitionProps {
  taskId: string;
  currentStatus: TaskStatus;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  open: { label: "Open", color: "bg-slate-100 text-slate-700 border-slate-200", icon: CaretRight },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Timer },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Check },
  blocked: { label: "Blocked", color: "bg-rose-100 text-rose-700 border-rose-200", icon: Prohibit },
  cancelled: { label: "Cancelled", color: "bg-slate-200 text-slate-800 border-slate-300", icon: XCircle },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const validTransitions: Record<TaskStatus, TaskStatus[]> = {
  open: ["in-progress", "blocked", "cancelled"],
  "in-progress": ["completed", "blocked", "cancelled", "open"],
  completed: ["in-progress"],
  blocked: ["open", "in-progress", "cancelled"],
  cancelled: ["open"],
};

export function StatusTransition({ taskId, currentStatus }: StatusTransitionProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const transitions = validTransitions[currentStatus] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</span>
        <Badge variant="outline" className={cn("text-xs font-black uppercase tracking-widest px-3 py-1", statusConfig[currentStatus].color)}>
          {statusConfig[currentStatus].label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Button
              key={status}
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleStatusChange(status)}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-xs font-bold"
            >
              <Icon size={14} weight="bold" />
              MOVE TO {config.label.toUpperCase()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
