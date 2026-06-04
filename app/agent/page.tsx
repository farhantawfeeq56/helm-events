"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
      { id: 1, action: "Push back keynote by 20 minutes" },
      { id: 2, action: "Extend morning networking break" },
      { id: 3, action: "Notify attendees via mobile app" },
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
      { id: 4, action: "Deploy electrical team to Booth 42" },
      { id: 5, action: "Verify load capacity with venue" },
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
      { id: 6, action: "Reassign volunteers from Session Support" },
      { id: 7, action: "Call backup volunteer list" },
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
      { id: 8, action: "Switch to backup cellular hotspots" },
      { id: 9, action: "Contact venue IT department" },
      { id: 10, action: "Post status update on event portal" },
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

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const handleActionClick = (message: string) => {
    setInput(message);
  };

  const selectedIncident = mockIncidents.find(i => i.id === selectedIncidentId);

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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center px-6 py-10">
          {!selectedIncident ? (
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
                      onClick={() => setSelectedIncidentId(incident.id)}
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
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button 
                variant="ghost" 
                className="mb-6 -ml-2 text-slate-500 hover:text-slate-900"
                onClick={() => setSelectedIncidentId(null)}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Dashboard
              </Button>

              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {selectedIncident.title}
                  </h1>
                  <p className="text-slate-500">Reported {selectedIncident.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("px-3 py-1 text-xs font-semibold border", getSeverityColor(selectedIncident.severity))}>
                    {selectedIncident.severity} Severity
                  </Badge>
                  <Badge className={cn("px-3 py-1 text-xs font-semibold border", getStatusColor(selectedIncident.status))}>
                    {selectedIncident.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Info size={18} className="text-blue-500" />
                      Incident Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedIncident.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Pulse size={18} className="text-orange-500" />
                      Impact Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selectedIncident.impact.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <CheckCircle size={18} className="text-emerald-500" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedIncident.recommendedActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                        <span className="text-sm text-slate-700">{action.action}</span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-0">
                            <Check size={16} weight="bold" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 p-0">
                            <X size={16} weight="bold" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <ShieldWarning size={18} className="text-amber-500" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Risk Level:</span>
                        <Badge variant="outline" className={cn(
                          "px-2 py-0 text-[10px] font-bold uppercase",
                          selectedIncident.riskAssessment.level === "High" ? "border-red-200 text-red-600 bg-red-50" :
                          selectedIncident.riskAssessment.level === "Medium" ? "border-amber-200 text-amber-600 bg-amber-50" :
                          "border-blue-200 text-blue-600 bg-blue-50"
                        )}>
                          {selectedIncident.riskAssessment.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedIncident.riskAssessment.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      <Pulse size={18} className="text-purple-500" />
                      Execution Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-lg bg-purple-50 px-4 py-3 border border-purple-100">
                      <div className="flex h-2 w-2">
                        <span className="absolute h-2 w-2 animate-ping rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative h-2 w-2 rounded-full bg-purple-500"></span>
                      </div>
                      <span className="text-sm font-medium text-purple-900">
                        {selectedIncident.executionStatus}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedIncident && (
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
      )}
    </div>
  );
}
