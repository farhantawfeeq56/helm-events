"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "./collection-table";

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
      ];
    case "sessions":
      return [
        { header: "Title", accessorKey: "title" },
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
            <Badge className="capitalize">{item.status}</Badge>
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
