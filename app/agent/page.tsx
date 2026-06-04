"use client";

import { useState } from "react";
import {
  Sparkle,
  ArrowUp,
  Calendar,
  User,
  MapPin,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const starters = [
  {
    label: "Create an event",
    message: "I want to create a new event called 'AI for Everyone' on Oct 12th.",
    icon: Calendar,
  },
  {
    label: "Add a speaker",
    message: "Add Sarah Chen as a speaker for the AI Summit.",
    icon: User,
  },
  {
    label: "Find a venue",
    message: "Look for available venues in San Francisco for 500 people.",
    icon: MapPin,
  },
  {
    label: "Manage volunteers",
    message: "Show me the list of volunteers for the upcoming workshop.",
    icon: Users,
  },
];

export default function AgentPage() {
  const [input, setInput] = useState("");

  const handleStarterClick = (message: string) => {
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
              How can I help with your events today?
            </h1>
            <p className="mb-10 text-lg text-slate-600">
              Ask me to create events, add speakers, or manage your operations data.
            </p>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  onClick={() => handleStarterClick(starter.message)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 text-left transition-all hover:border-sky-300 hover:bg-white hover:shadow-md hover:shadow-sky-100 group cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-100 group-hover:text-sky-600">
                    <starter.icon size={20} />
                  </div>
                  <span className="font-medium text-slate-700">{starter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 pb-8 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <Textarea
              placeholder="Ask anything..."
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
