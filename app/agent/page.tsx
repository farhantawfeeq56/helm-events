"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkle,
  ArrowUp,
  Pulse,
  ShieldCheck,
  Broadcast,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAgent } from "@/hooks/use-agent";
import { MessageItem, TypingIndicator } from "@/components/agent/message-item";
import { EventContext } from "@/components/agent/event-context";
import { operationalActions } from "@/lib/constants";

const ACTIVE_INCIDENT_STATUSES = ["open", "investigating", "mitigated"];

interface ActivePanelIncident {
  id: string;
  title: string;
  severity: string; // lowercased
  timestamp: string;
}

interface RawIncident {
  _id: unknown;
  slug?: string;
  title?: string;
  type?: string;
  severity?: string;
  status?: string;
  reportedAt?: string | Date;
  createdAt?: string | Date;
}

interface RecentActivity {
  _id: string;
  type?: "human" | "agent";
  details?: string;
  action?: string;
}

/** Compact relative time ("3m ago") for the incident rail. */
function formatRelative(value?: string | Date): string {
  if (!value) return "Just now";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Just now";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatClockTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
}

export default function AgentPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isTyping,
    streamStatus,
    handleSendMessage,
    handleActionDecision,
    handleGlobalDecision
  } = useAgent();

  const [dbIncidents, setDbIncidents] = useState<ActivePanelIncident[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [clock, setClock] = useState(() => new Date());

  // Live clock in the status bar (was a frozen "10:42:15 AM").
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Real active incidents from the DB, refreshed periodically. Re-fetches when a
  // new agent message lands (an operational-card likely just persisted one).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/incidents?limit=50", { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !data?.success || !Array.isArray(data.data)) return;
        const mapped: ActivePanelIncident[] = data.data
          .filter((d: { status?: string }) => ACTIVE_INCIDENT_STATUSES.includes((d.status || "open").toLowerCase()))
          .map((d: RawIncident) => ({
            id: d.slug || String(d._id),
            title: d.title || d.type || "Incident",
            severity: (d.severity || "medium").toLowerCase(),
            timestamp: formatRelative(d.reportedAt || d.createdAt),
          }));
        setDbIncidents(mapped);
      } catch {
        /* keep last known */
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [messages.length]);

  // Recent operational activity for the welcome-screen feed (replaces fabricated quotes).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/activities?limit=3", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.data)) {
          setRecentActivities(data.data as RecentActivity[]);
        }
      } catch {
        /* feed simply stays empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge DB incidents with any the agent raised this session (so a freshly
  // reported one appears immediately), de-duplicated by id.
  const reportedIncidents = useMemo(() => {
    const map = new Map<string, ActivePanelIncident>();
    for (const inc of dbIncidents) map.set(inc.id, inc);
    messages.forEach((msg) => {
      if (msg.incidentData && !map.has(msg.incidentData.id)) {
        map.set(msg.incidentData.id, {
          id: msg.incidentData.id,
          title: msg.incidentData.title,
          severity: (msg.incidentData.severity || "medium").toLowerCase(),
          timestamp: msg.incidentData.timestamp || "Just now",
        });
      }
    });
    return Array.from(map.values());
  }, [dbIncidents, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const onSend = (text: string) => {
    handleSendMessage(text);
    setInput("");
  };

  const handleModifyPlan = (title: string) => {
    const text = `Option [${title}] with the following modifications: `;
    setInput(text);
    
    // Focus textarea and put cursor at the end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(text.length, text.length);
      }
    }, 0);
  };

  const handleMyOwnPlan = () => {
    const text = "Ignore the proposed options and proceed with the following plan: ";
    setInput(text);

    // Focus textarea and put cursor at the end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(text.length, text.length);
      }
    }, 0);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);

    // Focus textarea and put cursor at the end so the operator can answer inline
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(text.length, text.length);
      }
    }, 0);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Top Status Bar */}
      <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Pulse size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ops Level: Normal</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-[10px] font-black tabular-nums tracking-widest">{formatClockTime(clock)}</span>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] font-bold">
            v2.0.4-OPERATIONAL
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto flex min-h-full max-w-4xl flex-col px-6 py-8">
              {messages.length === 0 ? (
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-slate-900 text-white shadow-2xl ring-8 ring-slate-100">
                      <Sparkle size={40} weight="fill" className="text-sky-400" />
                    </div>
                    <h1 className="mb-2 text-4xl font-black tracking-tighter text-slate-900">
                      HERMES<span className="text-sky-600">.OPS</span>
                    </h1>
                    <p className="max-w-md text-lg font-medium text-slate-500 leading-tight">
                      Event Operations Intelligence & Command Center. 
                      Select an incident or issue a system command.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {operationalActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => setInput(action.message)}
                        className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-100"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                          <action.icon size={24} weight="duotone" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase tracking-wider text-slate-900">{action.label}</span>
                          <span className="text-xs font-medium text-slate-400">Execute command</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 transition-opacity group-hover:opacity-10">
                          <action.icon size={80} weight="fill" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {recentActivities.length > 0 && (
                    <div className="rounded-[2rem] border border-slate-200 bg-white/50 p-6 backdrop-blur-md">
                      <div className="mb-4 flex items-center gap-2">
                        <Broadcast size={18} className="text-sky-600" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Live Global Feed</h2>
                      </div>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div
                            key={activity._id}
                            className={`flex gap-4 border-l-2 pl-4 py-1 ${
                              activity.type === "agent" ? "border-indigo-500" : "border-emerald-500"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span
                                className={`text-[10px] font-black uppercase ${
                                  activity.type === "agent" ? "text-indigo-600" : "text-emerald-600"
                                }`}
                              >
                                {activity.type === "agent" ? "Hermes" : "Operations"}
                              </span>
                              <p className="text-sm font-medium text-slate-600 line-clamp-2">{activity.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-10 pb-20">
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onActionDecision={handleActionDecision}
                      onModifyPlan={handleModifyPlan}
                      onMyOwnPlan={handleMyOwnPlan}
                      onGlobalDecision={handleGlobalDecision}
                      onQuickReply={handleQuickReply}
                    />
                  ))}
                  {isTyping && <TypingIndicator status={streamStatus} />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Command Input Area */}
          <div className="w-full border-t border-slate-200 bg-white/80 p-6 backdrop-blur-xl">
            <div className="mx-auto max-w-4xl">
              <div className="relative flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-2xl transition-all focus-within:border-sky-500 focus-within:ring-8 focus-within:ring-sky-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ml-1">
                  <span className="font-mono text-lg font-bold">/</span>
                </div>
                <Textarea
                  ref={textareaRef}
                  placeholder="Enter operational command (e.g., /analyze speaker-delay)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend(input);
                    }
                  }}
                  className="min-h-[48px] w-full resize-none border-none bg-transparent px-0 py-3 text-base font-medium placeholder:text-slate-400 focus-visible:ring-0"
                />
                <Button
                  onClick={() => onSend(input)}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-2xl bg-slate-900 text-white transition-all hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 mr-1"
                >
                  <ArrowUp size={24} weight="bold" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Line</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Augmented</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GCP Integrated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Incident List */}
        <div className="hidden w-80 flex-col border-l border-slate-200 bg-white lg:flex">
          <EventContext />
          <div className="p-4 border-b border-slate-100 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Incidents</h2>
              <Badge className="bg-red-50 text-red-600 border-red-100 font-bold">{reportedIncidents.length}</Badge>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {reportedIncidents.length === 0 ? (
                <p className="text-xs font-medium text-slate-400 py-6 text-center">
                  No active incidents. Report one in the command line to begin.
                </p>
              ) : (
                reportedIncidents.map((incident) => (
                  <button
                    key={incident.id}
                    onClick={() => router.push(`/incidents/${incident.id}`)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">{incident.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{incident.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="h-4 px-1 text-[8px] font-black uppercase bg-slate-100 text-slate-500 border-none capitalize">
                        {incident.severity}
                      </Badge>
                      <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            incident.severity === "critical" ? "bg-red-500" :
                            incident.severity === "high" ? "bg-orange-500" : "bg-sky-500"
                          }`}
                          style={{ width: incident.severity === "critical" ? "100%" : incident.severity === "high" ? "60%" : "30%" }}
                        />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 text-slate-500">
              <ShieldCheck size={20} weight="duotone" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight">Security Protocol</span>
                <span className="text-[10px] font-medium">Encrypted & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
