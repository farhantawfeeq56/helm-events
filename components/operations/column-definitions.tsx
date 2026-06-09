"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "./collection-table";
import Link from "next/link";

export const getColumns = (collectionName: string): Column<any>[] => {
  switch (collectionName) {
    case "speakers":
      return [
        { header: "Name", accessorKey: "fullName" },
        { header: "Email", accessorKey: "email" },
        { header: "Company", accessorKey: "company" },
        { header: "Topic", accessorKey: "topic" },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "Confirmed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : item.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-slate-50 text-slate-700 border-slate-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
      ];
    case "volunteers":
      return [
        { header: "Name", accessorKey: "fullName" },
        { header: "Email", accessorKey: "email" },
        { header: "Role", accessorKey: "role" },
        { header: "Shift", accessorKey: "shift" },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : item.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-slate-50 text-slate-700 border-slate-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
      ];
    case "sponsors":
      return [
        { header: "Company", accessorKey: "companyName" },
        {
          header: "Tier",
          accessorKey: "tier",
          cell: (item: any) => (
            <Badge
              className={
                item.tier === "Platinum"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : item.tier === "Gold"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : item.tier === "Silver"
                  ? "bg-slate-200 text-slate-700 border-slate-300"
                  : "bg-orange-50 text-orange-700 border-orange-100"
              }
            >
              {item.tier}
            </Badge>
          ),
        },
        { header: "Contact", accessorKey: "contact" },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
      ];
    case "attendees":
      return [
        { header: "Name", accessorKey: "fullName" },
        { header: "Email", accessorKey: "email" },
        { header: "Organization", accessorKey: "organization" },
        {
          header: "Ticket",
          accessorKey: "ticketType",
          cell: (item: any) => (
            <Badge variant="outline" className="font-medium">
              {item.ticketType}
            </Badge>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "Checked-in"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : item.status === "Registered"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
      ];
    case "events":
      return [
        { header: "Event Name", accessorKey: "name" },
        { header: "Venue", accessorKey: "venue" },
        { header: "City", accessorKey: "city" },
        {
          header: "Start Date",
          accessorKey: "startDate",
          cell: (item: any) => new Date(item.startDate).toLocaleDateString(),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge className="capitalize">{item.status}</Badge>
          ),
        },
        {
          header: "Ops",
          accessorKey: "_id",
          cell: (item: any) => (
            <div className="flex gap-2">
              <Link
                href={`/operations?collection=incidents&eventId=${item._id}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Incidents
              </Link>
              <Link
                href={`/operations?collection=tasks&eventId=${item._id}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Tasks
              </Link>
            </div>
          ),
        },
      ];
    case "sessions":
      return [
        { header: "Title", accessorKey: "title" },
        {
          header: "Speaker",
          accessorKey: "speakerIds",
          cell: (item: any) => (
            <div className="flex flex-wrap gap-1">
              {item.speakerIds && item.speakerIds.length > 0 ? (
                item.speakerIds.map((s: any, idx: number) => (
                  <Link
                    key={s._id || idx}
                    href={`/operations?collection=speakers&search=${encodeURIComponent(s.fullName || "")}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {s.fullName}
                    {idx < item.speakerIds.length - 1 ? ", " : ""}
                  </Link>
                ))
              ) : (
                <span className="text-slate-400">TBD</span>
              )}
            </div>
          ),
        },
        {
          header: "Room",
          accessorKey: "roomId",
          cell: (item: any) =>
            item.roomId ? (
              <Link
                href={`/operations?collection=rooms&search=${encodeURIComponent(item.roomId.name || "")}`}
                className="text-indigo-600 hover:underline"
              >
                {item.roomId.name}
              </Link>
            ) : (
              <span className="text-slate-400">N/A</span>
            ),
        },
        { header: "Track", accessorKey: "track" },
        {
          header: "Start",
          accessorKey: "startTime",
          cell: (item: any) => new Date(item.startTime).toLocaleString(),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "live"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : item.status === "confirmed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-50 text-slate-700 border-slate-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
      ];
    case "tasks":
      return [
        { header: "Title", accessorKey: "title" },
        { header: "Assigned To", accessorKey: "assignedTo" },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : item.status === "in-progress"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : item.status === "blocked"
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : "bg-slate-50 text-slate-700 border-slate-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
        {
          header: "Related",
          accessorKey: "incidentId",
          cell: (item: any) =>
            item.incidentId ? (
              <Link
                href={`/operations?collection=incidents&search=${encodeURIComponent(
                  typeof item.incidentId === "object"
                    ? item.incidentId.description
                    : item.incidentId
                )}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                {typeof item.incidentId === "object"
                  ? `Incident: ${item.incidentId.type}`
                  : "View Incident"}
              </Link>
            ) : (
              <span className="text-xs text-slate-400">Event Level</span>
            ),
        },
      ];
    case "incidents":
      return [
        { header: "Description", accessorKey: "description" },
        {
          header: "Type",
          accessorKey: "type",
          cell: (item: any) => (
            <Badge variant="outline" className="font-medium">
              {item.type}
            </Badge>
          ),
        },
        {
          header: "Severity",
          accessorKey: "severity",
          cell: (item: any) => (
            <Badge
              className={
                item.severity === "critical"
                  ? "bg-red-600 text-white"
                  : item.severity === "high"
                  ? "bg-orange-500 text-white"
                  : item.severity === "medium"
                  ? "bg-amber-400 text-white"
                  : "bg-blue-400 text-white"
              }
            >
              {item.severity}
            </Badge>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (item: any) => (
            <Badge
              className={
                item.status === "resolved" || item.status === "closed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : item.status === "investigating"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-slate-50 text-slate-700 border-slate-100"
              }
            >
              {item.status}
            </Badge>
          ),
        },
        {
          header: "Tasks",
          accessorKey: "_id",
          cell: (item: any) => (
            <Link
              href={`/operations?collection=tasks&incidentId=${item._id}`}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage Tasks
            </Link>
          ),
        },
      ];
    case "rooms":
      return [
        { header: "Name", accessorKey: "name" },
        { header: "Capacity", accessorKey: "capacity" },
        { header: "Location", accessorKey: "location" },
        { header: "Setup", accessorKey: "setupStyle" },
      ];
    case "organizers":
      return [
        { header: "Name", accessorKey: "fullName" },
        { header: "Email", accessorKey: "email" },
        { header: "Organization", accessorKey: "organization" },
        { header: "Role", accessorKey: "role" },
      ];
    case "facilities":
      return [
        { header: "Name", accessorKey: "name" },
        { header: "Type", accessorKey: "type" },
        { header: "Address", accessorKey: "address" },
        { header: "Capacity", accessorKey: "capacity" },
      ];
    case "logs":
      return [
        { header: "Method", accessorKey: "method" },
        { header: "Path", accessorKey: "path" },
        { header: "Status", accessorKey: "status" },
        { header: "Duration", accessorKey: "duration" },
      ];
    case "health":
      return [
        { header: "Service", accessorKey: "service" },
        { header: "Status", accessorKey: "status" },
        { header: "Uptime", accessorKey: "uptime" },
      ];
    case "analytics":
      return [
        { header: "Metric", accessorKey: "name" },
        { header: "Value", accessorKey: "value" },
        { header: "Change", accessorKey: "change" },
      ];
    case "activities":
      return [
        { header: "User", accessorKey: "user" },
        {
          header: "Type",
          accessorKey: "type",
          cell: (item: any) => (
            <Badge
              className={
                item.type === "agent"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }
            >
              {item.type}
            </Badge>
          ),
        },
        { header: "Action", accessorKey: "action" },
        { header: "Target", accessorKey: "target" },
        {
          header: "Timestamp",
          accessorKey: "timestamp",
          cell: (item: any) => new Date(item.timestamp).toLocaleString(),
        },
      ];
    default:
      return [];
  }
};
