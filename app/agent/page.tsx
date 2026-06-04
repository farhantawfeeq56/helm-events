"use client";

import { useState } from "react";
import {
  Sparkle,
  ArrowUp,
  Clock,
  Warning,
  UserCircle,
  CalendarPlus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const operationalActions = [
  {
    label: "Speaker Delayed",
    message: "I need to report a speaker delay for the keynote. What's the protocol?",
    icon: Clock,
  },
  {
    label: "Room Conflict",
    message: "There's a room conflict in Hall B between 2 PM and 3 PM. Help me resolve it.",
    icon: Warning,
  },
  {
    label: "VIP Arrival",
    message: "A VIP has just arrived at the main entrance. Notify the welcoming committee.",
    icon: UserCircle,
  },
  {
    label: "Schedule Update",
    message: "Update the schedule for the 'Future of AI' panel to start at 4 PM instead of 3:30 PM.",
    icon: CalendarPlus,
  },
];

const activeIncidents = [
  {
    title: "Main Hall Wi-Fi Down",
    status: "Ongoing",
    level: "Critical",
    time: "2m ago",
  },
  {
    title: "Catering Delayed - Lunch",
    status: "Resolving",
    level: "High",
    time: "15m ago",
  },
];

export default function AgentPage() {
  const [input, setInput] = useState("");

  const handleActionClick = (message: string) => {
    setInput(message);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-10">
          <div className="flex w-full flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 shadow-sm ring-1 ring-sky-200/50">
              <Sparkle size={32} weight="fill" />
            </div>
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Global Tech Summit 2024
            </h1>
            <p className="mb-10 text-lg text-slate-600">
              Day 2 • Live Operations Command Center
            </p>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {operationalActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleActionClick(action.message)}
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
                <Badge variant="destructive" className="rounded-lg px-2 py-0">
                  {activeIncidents.length} Live
                </Badge>
              </div>
              <div className="space-y-3">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.title}
                    className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/50 p-4 transition-all hover:bg-red-50"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {incident.title}
                        </span>
                        <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                          {incident.level}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {incident.status} • {incident.time}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 pb-8 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <Textarea
              placeholder="Issue an operational command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] border-none bg-transparent px-4 py-3 focus-visible:ring-0"
            />
            <div className="flex items-center justify-end px-2 pb-1">
              <Button
                size="icon"
                disabled={!input.trim()}
                className="h-10 w-10 rounded-2xl bg-sky-600 text-white transition-all hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <ArrowUp size={20} weight="bold" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
