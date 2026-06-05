"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkle,
  ArrowUp,
  DotsThree,
  Activity,
  ShieldCheck,
  Broadcast,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { mockIncidents } from "@/lib/hermes";
import { useAgent } from "@/hooks/use-agent";
import { MessageItem, TypingIndicator } from "@/components/agent/message-item";
import { IncidentListItem } from "@/components/agent/incident-list-item";
import { operationalActions } from "@/lib/constants";

export default function AgentPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isTyping, 
    handleSendMessage, 
    handleActionDecision, 
    handleGlobalDecision 
  } = useAgent();

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
            <Activity size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ops Level: Normal</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-[10px] font-black tabular-nums tracking-widest">10:42:15 AM</span>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] font-bold">
            v2.0.4-OPERATIONAL
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Incident List */}
        <div className="hidden w-80 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Incidents</h2>
              <Badge className="bg-red-50 text-red-600 border-red-100 font-bold">{mockIncidents.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
              {mockIncidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => onSend(`Analyze incident: ${incident.title}`)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">{incident.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{incident.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="h-4 px-1 text-[8px] font-black uppercase bg-slate-100 text-slate-500 border-none">
                      {incident.severity}
                    </Badge>
                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          incident.severity === 'Critical' ? 'bg-red-500' : 
                          incident.severity === 'High' ? 'bg-orange-500' : 'bg-sky-500'
                        }`} 
                        style={{ width: incident.severity === 'Critical' ? '100%' : incident.severity === 'High' ? '60%' : '30%' }}
                      />
                    </div>
                  </div>
                </button>
              ))}
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
                        onClick={() => onSend(action.message)}
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

                  <div className="rounded-[2rem] border border-slate-200 bg-white/50 p-6 backdrop-blur-md">
                    <div className="mb-4 flex items-center gap-2">
                      <Broadcast size={18} className="text-sky-600" />
                      <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Live Global Feed</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4 border-l-2 border-emerald-500 pl-4 py-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-emerald-600 uppercase">Success</span>
                          <p className="text-sm font-medium text-slate-600 italic">"Registration flow stabilized. Latency down by 40%."</p>
                        </div>
                      </div>
                      <div className="flex gap-4 border-l-2 border-orange-500 pl-4 py-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-orange-600 uppercase">Warning</span>
                          <p className="text-sm font-medium text-slate-600 italic">"VIP transport delayed on 5th Ave. ETA +15m."</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-10 pb-20">
                  {messages.map((message) => (
                    <MessageItem 
                      key={message.id} 
                      message={message} 
                      onActionDecision={handleActionDecision}
                      onGlobalDecision={handleGlobalDecision}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
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
      </div>
    </div>
  );
}
