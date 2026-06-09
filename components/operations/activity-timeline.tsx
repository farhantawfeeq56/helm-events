"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Robot, Clock, Info } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Activity {
  _id: string;
  user: string;
  type: "human" | "agent";
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/activities");
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Clock size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No activities recorded yet.</p>
        <p className="text-sm">Activities will appear here as they happen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
        {activities.map((activity) => (
          <div key={activity._id} className="relative pl-12 group">
            {/* Timeline Dot/Icon */}
            <div className={cn(
              "absolute left-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm z-10",
              activity.type === "agent" ? "bg-indigo-100" : "bg-emerald-100"
            )}>
              {activity.type === "agent" ? (
                <Robot size={18} className="text-indigo-600" weight="bold" />
              ) : (
                <User size={18} className="text-emerald-600" weight="bold" />
              )}
            </div>

            {/* Content */}
            <Card className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{activity.action}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] uppercase tracking-wider px-1.5 py-0",
                      activity.type === 'agent' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}
                  >
                    {activity.type}
                  </Badge>
                </div>
                <time className="text-xs font-medium text-slate-500 whitespace-nowrap">
                  {formatDate(activity.timestamp)}
                </time>
              </div>
              
              <div className="text-slate-600 text-sm mb-3">
                <span className="font-semibold text-slate-800">{activity.user}</span>
                <span className="mx-1">on</span>
                <span className="font-semibold text-slate-800">{activity.target}</span>
              </div>

              {activity.details && (
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                  <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
                  <span className="leading-relaxed">{activity.details}</span>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
