"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkle,
  ArrowUp,
  Clock,
  Warning,
  UserCircle,
  CalendarPlus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  ShieldWarning,
  Pulse,
  WifiHigh,
  UserPlus,
  Handshake,
  Check,
  X,
  CaretRight,
  DotsThree,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  type: "text" | "operational-card";
  incidentData?: typeof mockIncidents[0];
}

const mockIncidents = [
  {
    id: "speaker-delay",
    title: "Speaker Delay",
    severity: "High",
    status: "Investigating",
    timestamp: "10m ago",
    description: "Keynote speaker Dr. Sarah Chen is stuck in traffic and will be 20 minutes late for her 10:00 AM session.",
    impact: ["Main Stage Schedule", "Attendee Flow", "Live Stream Timing"],
    recommendedActions: [
      { id: 1, action: "Push back keynote by 20 minutes", status: "pending" },
      { id: 2, action: "Extend morning networking break", status: "pending" },
      { id: 3, action: "Notify attendees via mobile app", status: "pending" },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Delay might cascade into afternoon sessions if not managed properly.",
    },
    executionStatus: "Awaiting approval for schedule adjustment.",
    icon: Clock,
    color: "amber",
  },
  {
    id: "sponsor-request",
    title: "Sponsor Request",
    severity: "Medium",
    status: "Open",
    timestamp: "25m ago",
    description: "Lead sponsor 'TechCorp' requested additional power outlets for their booth in the Expo Hall.",
    impact: ["Expo Hall Infrastructure", "Sponsor Satisfaction"],
    recommendedActions: [
      { id: 4, action: "Deploy electrical team to Booth 42", status: "pending" },
      { id: 5, action: "Verify load capacity with venue", status: "pending" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Standard operational request, minimal risk to overall event.",
    },
    executionStatus: "Electrical team notified.",
    icon: Handshake,
    color: "blue",
  },
  {
    id: "volunteer-absence",
    title: "Volunteer Absence",
    severity: "Medium",
    status: "In Progress",
    timestamp: "45m ago",
    description: "Three volunteers for the registration desk failed to show up for their shift.",
    impact: ["Registration Wait Times", "Entrance Logistics"],
    recommendedActions: [
      { id: 6, action: "Reassign volunteers from Session Support", status: "pending" },
      { id: 7, action: "Call backup volunteer list", status: "pending" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Can be managed by reallocating existing staff momentarily.",
    },
    executionStatus: "Contacting backup volunteers.",
    icon: UserPlus,
    color: "orange",
  },
  {
    id: "internet-outage",
    title: "Internet Outage",
    severity: "Critical",
    status: "Investigating",
    timestamp: "5m ago",
    description: "Wi-Fi connectivity lost in Hall B, affecting several workshops and live demos.",
    impact: ["Workshop Connectivity", "Demo Performance", "Attendee Experience"],
    recommendedActions: [
      { id: 8, action: "Switch to backup cellular hotspots", status: "pending" },
      { id: 9, action: "Contact venue IT department", status: "pending" },
      { id: 10, action: "Post status update on event portal", status: "pending" },
    ],
    riskAssessment: {
      level: "High",
      explanation: "Multiple sessions rely on internet; downtime significantly impacts session quality.",
    },
    executionStatus: "Venue IT investigating fiber line.",
    icon: WifiHigh,
    color: "red",
  },
];

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

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "bg-red-100 text-red-700 border-red-200";
    case "high": return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
    case "low": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "investigating": return "bg-purple-100 text-purple-700 border-purple-200";
    case "in progress": return "bg-blue-100 text-blue-700 border-blue-200";
    case "open": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "resolving": return "bg-sky-100 text-sky-700 border-sky-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

function OperationalCard({ incident, onActionDecision, onGlobalDecision }: { 
  incident: typeof mockIncidents[0], 
  onActionDecision: (actionId: number, decision: 'approved' | 'declined') => void,
  onGlobalDecision: (type: 'escalate' | 'resolve') => void
}) {
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'declined'>>({});

  const handleDecision = (id: number, decision: 'approved' | 'declined') => {
    setDecisions(prev => ({ ...prev, [id]: decision }));
    onActionDecision(id, decision);
  };

  return (
    <Card className="w-full border-slate-200 shadow-lg bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
              incident.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-600"
            )}>
              <incident.icon size={24} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{incident.title}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("h-4 px-1.5 text-[10px] font-bold border uppercase", getSeverityColor(incident.severity))}>
                  {incident.severity}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">{incident.timestamp}</span>
              </div>
            </div>
          </div>
          <Badge className={cn("px-2 py-0.5 text-xs font-semibold border", getStatusColor(incident.status))}>
            {incident.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Info size={16} className="text-blue-500" />
            Situation
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {incident.description}
          </p>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Pulse size={16} className="text-orange-500" />
            Impact Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {incident.impact.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <ShieldWarning size={16} className="text-amber-500" />
            Risk Assessment
          </h3>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900">Level:</span>
              <Badge variant="outline" className={cn(
                "px-1.5 py-0 text-[10px] font-bold uppercase",
                incident.riskAssessment.level === "High" ? "border-red-200 text-red-600 bg-red-50" :
                incident.riskAssessment.level === "Medium" ? "border-amber-200 text-amber-600 bg-amber-50" :
                "border-blue-200 text-blue-600 bg-blue-50"
              )}>
                {incident.riskAssessment.level}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {incident.riskAssessment.explanation}
            </p>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <CheckCircle size={16} className="text-emerald-500" />
            Recommended Actions
          </h3>
          <div className="space-y-2">
            {incident.recommendedActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">{action.action}</span>
                <div className="flex items-center gap-2">
                  {decisions[action.id] === 'approved' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <Check size={12} weight="bold" /> Approved
                    </Badge>
                  ) : decisions[action.id] === 'declined' ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                      <X size={12} weight="bold" /> Declined
                    </Badge>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDecision(action.id, 'approved')}
                        className="h-8 px-3 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDecision(action.id, 'declined')}
                        className="h-8 px-3 rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          onClick={() => onGlobalDecision('escalate')}
        >
          Escalate to Director
        </Button>
        <Button 
          className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => onGlobalDecision('resolve')}
        >
          Mark as Resolved
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let incidentData = null;

      if (lowerText.includes("delay")) {
        incidentData = mockIncidents.find((i) => i.id === "speaker-delay");
      } else if (lowerText.includes("sponsor")) {
        incidentData = mockIncidents.find((i) => i.id === "sponsor-request");
      } else if (lowerText.includes("volunteer")) {
        incidentData = mockIncidents.find((i) => i.id === "volunteer-absence");
      } else if (lowerText.includes("internet") || lowerText.includes("wifi")) {
        incidentData = mockIncidents.find((i) => i.id === "internet-outage");
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: incidentData 
          ? `I've analyzed the ${incidentData.title} incident. Here is the operational assessment and recommended actions:`
          : "I've reviewed the situation. How would you like me to proceed with this request?",
        type: incidentData ? "operational-card" : "text",
        incidentData: incidentData || undefined,
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleActionDecision = (actionId: number, decision: 'approved' | 'declined') => {
    // Add a confirmation message
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: `Action ${decision === 'approved' ? 'approved' : 'declined'}. Updating operational logs...`,
      type: "text",
    };
    setMessages(prev => [...prev, confirmation]);
  };

  const handleGlobalDecision = (type: 'escalate' | 'resolve') => {
    const confirmation: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: type === 'escalate' 
        ? "Incident escalated to the Operations Director. They will be notified immediately."
        : "Incident marked as resolved. Finalizing report and updating status across all dashboards.",
      type: "text",
    };
    setMessages(prev => [...prev, confirmation]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-10">
          {messages.length === 0 ? (
            <div className="flex w-full flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 shadow-sm ring-1 ring-sky-200/50">
                <Sparkle size={32} weight="fill" />
              </div>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Operational Assistant
              </h1>
              <p className="mb-10 text-lg text-slate-600">
                Global Tech Summit 2024 Command Center
              </p>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {operationalActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSendMessage(action.message)}
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
                  <Badge variant="outline" className="rounded-lg px-2 py-0 bg-white">
                    {mockIncidents.length} Live
                  </Badge>
                </div>
                <div className="space-y-3">
                  {mockIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border p-4 transition-all hover:shadow-md cursor-pointer",
                        incident.severity === "Critical" 
                          ? "border-red-100 bg-red-50/50 hover:bg-red-50" 
                          : "border-slate-200 bg-white/60 hover:bg-white"
                      )}
                      onClick={() => handleSendMessage(`Analyze incident: ${incident.title}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          incident.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                        )}>
                          <incident.icon size={20} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {incident.title}
                            </span>
                            <Badge className={cn("h-4 px-1.5 text-[10px] font-medium border", getSeverityColor(incident.severity))}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">
                            {incident.status} • {incident.timestamp}
                          </span>
                        </div>
                      </div>
                      <CaretRight size={18} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full flex-col",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {message.role === "agent" && (
                    <div className="mb-2 flex items-center gap-2 ml-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
                        <Sparkle size={12} weight="fill" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assistant</span>
                    </div>
                  )}
                  
                  {message.type === "operational-card" && message.incidentData ? (
                    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="mb-4 text-slate-700 ml-1">{message.content}</p>
                      <OperationalCard 
                        incident={message.incidentData} 
                        onActionDecision={handleActionDecision}
                        onGlobalDecision={handleGlobalDecision}
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
                        message.role === "user"
                          ? "bg-sky-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      )}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="mb-2 flex items-center gap-2 ml-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
                      <Sparkle size={12} weight="fill" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assistant</span>
                  </div>
                  <div className="flex gap-1.5 rounded-2xl bg-white border border-slate-200 px-4 py-4 shadow-sm">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-6 pb-8 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50">
            <Textarea
              placeholder={messages.length === 0 ? "Describe an incident or issue a command..." : "Reply or issue another command..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              className="min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <DotsThree size={20} weight="bold" />
                </Button>
              </div>
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-2xl bg-sky-600 text-white transition-all hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <ArrowUp size={20} weight="bold" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Operational Assistant • Powered by EventOps AI
          </p>
        </div>
      </div>
    </div>
  );
}
