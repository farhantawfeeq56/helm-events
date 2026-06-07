import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Speaker } from "@/models/speaker";
import { Sponsor } from "@/models/sponsor";
import { Session } from "@/models/session";
import { Room } from "@/models/room";
import { Volunteer } from "@/models/volunteer";
import { Attendee } from "@/models/attendee";
import { Organizer } from "@/models/organizer";
import { Facility } from "@/models/facility";
import { APILog } from "@/models/api-log";
import { SystemHealth } from "@/models/system-health";
import { Analytics } from "@/models/analytics";
import { Team } from "@/models/team";
import { Task } from "@/models/task";
import { Incident } from "@/models/incident";
import { CollectionView } from "@/components/operations/collection-view";
import { Badge } from "@/components/ui/badge";
import { LinkedRecord, LinkedRecords } from "@/components/operations/linked-record";
import Link from "next/link";
import {
  Users,
  Calendar,
  MapPin,
  MicrophoneStage,
  Handshake,
  ChartLineUp,
  Pulse,
  ShieldCheck,
  ArrowLeft,
  CaretRight,
  Clock,
  CheckCircle,
  Buildings,
  IdentificationCard,
  Briefcase,
  CheckSquare,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; id?: string }>;
}) {
  await connectToDatabase();
  const { collection, id } = await searchParams;

  // Fetch counts
  const [
    eventCount,
    speakerCount,
    sponsorCount,
    sessionCount,
    roomCount,
    volunteerCount,
    attendeeCount,
    organizerCount,
    facilityCount,
    teamCount,
    taskCount,
    incidentCount,
  ] = await Promise.all([
    Event.countDocuments(),
    Speaker.countDocuments(),
    Sponsor.countDocuments(),
    Session.countDocuments(),
    Room.countDocuments(),
    Volunteer.countDocuments(),
    Attendee.countDocuments(),
    Organizer.countDocuments(),
    Facility.countDocuments(),
    Team.countDocuments(),
    Task.countDocuments(),
    Incident.countDocuments(),
  ]);

  // Fetch latest event for overview
  const latestEvent = await Event.findOne()
    .sort({ createdAt: -1 })
    .lean();

  // Column Definitions
  const speakerColumns = [
    { header: "Name", accessorKey: "fullName" as const },
    { header: "Email", accessorKey: "email" as const },
    { header: "Company", accessorKey: "company" as const },
    { header: "Topic", accessorKey: "topic" as const },
    {
      header: "Status",
      accessorKey: "status" as const,
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

  const volunteerColumns = [
    { header: "Name", accessorKey: "fullName" as const },
    { header: "Email", accessorKey: "email" as const },
    { header: "Role", accessorKey: "role" as const },
    { header: "Shift", accessorKey: "shift" as const },
    {
      header: "Status",
      accessorKey: "status" as const,
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

  const sponsorColumns = [
    { header: "Company", accessorKey: "companyName" as const },
    {
      header: "Tier",
      accessorKey: "tier" as const,
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
    { header: "Contact", accessorKey: "contact" as const },
    {
      header: "Status",
      accessorKey: "status" as const,
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

  const attendeeColumns = [
    { header: "Name", accessorKey: "fullName" as const },
    { header: "Email", accessorKey: "email" as const },
    { header: "Organization", accessorKey: "organization" as const },
    {
      header: "Ticket",
      accessorKey: "ticketType" as const,
      cell: (item: any) => (
        <Badge variant="outline" className="font-medium">
          {item.ticketType}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
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

  const eventColumns = [
    { header: "Event Name", accessorKey: "name" as const },
    { header: "Venue", accessorKey: "venue" as const },
    { header: "City", accessorKey: "city" as const },
    {
      header: "Start Date",
      accessorKey: "startDate" as const,
      cell: (item: any) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (item: any) => (
        <Badge className="capitalize">{item.status}</Badge>
      ),
    },
  ];

  const sessionColumns = [
    { header: "Title", accessorKey: "title" as const },
    {
      header: "Speakers",
      accessorKey: "speakerIds" as const,
      cell: (item: any) => (
        <LinkedRecords
          ids={item.speakerIds}
          collection="speakers"
          labels={item.speakerIds?.map((s: any) => typeof s === 'object' ? s.fullName : s)}
        />
      ),
    },
    {
      header: "Room",
      accessorKey: "roomId" as const,
      cell: (item: any) => (
        <LinkedRecord
          id={typeof item.roomId === 'object' ? item.roomId._id : item.roomId}
          collection="rooms"
          label={typeof item.roomId === 'object' ? item.roomId.name : item.roomId}
        />
      ),
    },
    { header: "Track", accessorKey: "track" as const },
    {
      header: "Start",
      accessorKey: "startTime" as const,
      cell: (item: any) => new Date(item.startTime).toLocaleString(),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (item: any) => (
        <Badge className="capitalize">{item.status}</Badge>
      ),
    },
  ];

  const roomColumns = [
    { header: "Name", accessorKey: "name" as const },
    { header: "Capacity", accessorKey: "capacity" as const },
    { header: "Location", accessorKey: "location" as const },
    { header: "Setup", accessorKey: "setupStyle" as const },
  ];

  const teamColumns = [
    { header: "Name", accessorKey: "name" as const },
    { header: "Description", accessorKey: "description" as const },
    {
      header: "Lead",
      accessorKey: "leadId" as const,
      cell: (item: any) => (
        <LinkedRecord
          id={typeof item.leadId === 'object' ? item.leadId._id : item.leadId}
          collection={item.leadModel === 'Volunteer' ? 'volunteers' : 'organizers'}
          label={typeof item.leadId === 'object' ? item.leadId.fullName : item.leadId}
        />
      ),
    },
    {
      header: "Members",
      accessorKey: "memberIds" as const,
      cell: (item: any) => (
        <LinkedRecords
          ids={item.memberIds}
          collection="volunteers"
          labels={item.memberIds?.map((m: any) => typeof m === 'object' ? m.fullName : m)}
        />
      ),
    },
  ];

  const taskColumns = [
    { header: "Title", accessorKey: "title" as const },
    {
      header: "Assigned To",
      accessorKey: "assignedToId" as const,
      cell: (item: any) => (
        <LinkedRecord
          id={typeof item.assignedToId === 'object' ? item.assignedToId._id : item.assignedToId}
          collection={item.assigneeModel === 'Volunteer' ? 'volunteers' : 'teams'}
          label={typeof item.assignedToId === 'object' ? (item.assigneeModel === 'Volunteer' ? item.assignedToId.fullName : item.assignedToId.name) : item.assignedToId}
        />
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (item: any) => (
        <Badge
          className={
            item.status === "Completed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : item.status === "In Progress"
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : "bg-slate-50 text-slate-700 border-slate-100"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority" as const,
      cell: (item: any) => (
        <Badge
          className={
            item.priority === "High"
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : item.priority === "Medium"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-50 text-slate-700 border-slate-100"
          }
        >
          {item.priority}
        </Badge>
      ),
    },
  ];

  const incidentColumns = [
    { header: "Title", accessorKey: "title" as const },
    {
      header: "Severity",
      accessorKey: "severity" as const,
      cell: (item: any) => (
        <Badge
          className={
            item.severity === "Critical"
              ? "bg-rose-600 text-white border-rose-700"
              : item.severity === "High"
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : item.severity === "Medium"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-blue-50 text-blue-700 border-blue-100"
          }
        >
          {item.severity}
        </Badge>
      ),
    },
    { header: "Status", accessorKey: "status" as const },
    {
      header: "Location",
      accessorKey: "locationId" as const,
      cell: (item: any) => (
        <LinkedRecord
          id={typeof item.locationId === 'object' ? item.locationId._id : item.locationId}
          collection="rooms"
          label={typeof item.locationId === 'object' ? item.locationId.name : item.locationId}
        />
      ),
    },
    {
      header: "Assigned Team",
      accessorKey: "assignedTeamId" as const,
      cell: (item: any) => (
        <LinkedRecord
          id={typeof item.assignedTeamId === 'object' ? item.assignedTeamId._id : item.assignedTeamId}
          collection="teams"
          label={typeof item.assignedTeamId === 'object' ? item.assignedTeamId.name : item.assignedTeamId}
        />
      ),
    },
  ];

  const organizerColumns = [
    { header: "Name", accessorKey: "fullName" as const },
    { header: "Email", accessorKey: "email" as const },
    { header: "Organization", accessorKey: "organization" as const },
    { header: "Role", accessorKey: "role" as const },
  ];

  const facilityColumns = [
    { header: "Name", accessorKey: "name" as const },
    { header: "Type", accessorKey: "type" as const },
    { header: "Address", accessorKey: "address" as const },
    { header: "Capacity", accessorKey: "capacity" as const },
  ];

  const logColumns = [
    { header: "Method", accessorKey: "method" as const },
    { header: "Path", accessorKey: "path" as const },
    { header: "Status", accessorKey: "status" as const },
    { header: "Duration", accessorKey: "duration" as const },
  ];

  const healthColumns = [
    { header: "Service", accessorKey: "service" as const },
    { header: "Status", accessorKey: "status" as const },
    { header: "Uptime", accessorKey: "uptime" as const },
  ];

  const analyticsColumns = [
    { header: "Metric", accessorKey: "name" as const },
    { header: "Value", accessorKey: "value" as const },
    { header: "Change", accessorKey: "change" as const },
  ];

  // Field Definitions for Dialogs
  const speakerFields = [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "company", label: "Company", type: "text" },
    { name: "topic", label: "Topic", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Confirmed", value: "Confirmed" },
        { label: "Pending", value: "Pending" },
        { label: "Withdrawn", value: "Withdrawn" },
      ],
    },
  ];

  const attendeeFields = [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "organization", label: "Organization", type: "text" },
    {
      name: "ticketType",
      label: "Ticket Type",
      type: "select",
      options: [
        { label: "VIP", value: "VIP" },
        { label: "General", value: "General" },
        { label: "Student", value: "Student" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Registered", value: "Registered" },
        { label: "Checked-in", value: "Checked-in" },
        { label: "Cancelled", value: "Cancelled" },
      ],
    },
  ];

  const volunteerFields = [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "role", label: "Role", type: "text" },
    { name: "shift", label: "Shift", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
  ];

  const sponsorFields = [
    { name: "companyName", label: "Company Name", type: "text" },
    {
      name: "tier",
      label: "Tier",
      type: "select",
      options: [
        { label: "Platinum", value: "Platinum" },
        { label: "Gold", value: "Gold" },
        { label: "Silver", value: "Silver" },
        { label: "Bronze", value: "Bronze" },
      ],
    },
    { name: "contact", label: "Contact Person", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  const eventFields = [
    { name: "name", label: "Event Name", type: "text" },
    { name: "venue", label: "Venue", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "startDate", label: "Start Date", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "endDate", label: "End Date", type: "text", placeholder: "YYYY-MM-DD" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Planning", value: "planning" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Live", value: "live" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];

  const sessionFields = [
    { name: "title", label: "Title", type: "text" },
    {
      name: "eventId",
      label: "Event",
      type: "relationship",
      collectionName: "events",
      displayField: "name",
    },
    {
      name: "speakerIds",
      label: "Speakers",
      type: "relationship",
      collectionName: "speakers",
      displayField: "fullName",
      isMulti: true,
    },
    {
      name: "roomId",
      label: "Room",
      type: "relationship",
      collectionName: "rooms",
      displayField: "name",
    },
    { name: "track", label: "Track", type: "text" },
    { name: "startTime", label: "Start Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
    { name: "endTime", label: "End Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Live", value: "live" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];

  const teamFields = [
    { name: "name", label: "Team Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "leadModel",
      label: "Lead Type",
      type: "select",
      options: [
        { label: "Volunteer", value: "Volunteer" },
        { label: "Organizer", value: "Organizer" },
      ],
    },
    {
      name: "leadId",
      label: "Team Lead",
      type: "relationship",
      collectionName: "volunteers", // Default, might need dynamic change but for now this is okay
      displayField: "fullName",
    },
    {
      name: "memberIds",
      label: "Team Members",
      type: "relationship",
      collectionName: "volunteers",
      displayField: "fullName",
      isMulti: true,
    },
  ];

  const taskFields = [
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "assigneeModel",
      label: "Assignee Type",
      type: "select",
      options: [
        { label: "Volunteer", value: "Volunteer" },
        { label: "Team", value: "Team" },
      ],
    },
    {
      name: "assignedToId",
      label: "Assigned To",
      type: "relationship",
      collectionName: "volunteers",
      displayField: "fullName",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
      ],
    },
    { name: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD" },
    {
      name: "relatedIncidentId",
      label: "Related Incident",
      type: "relationship",
      collectionName: "incidents",
      displayField: "title",
    },
  ];

  const incidentFields = [
    { name: "title", label: "Title", type: "text" },
    {
      name: "severity",
      label: "Severity",
      type: "select",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
      ],
    },
    { name: "status", label: "Status", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "locationId",
      label: "Location (Room)",
      type: "relationship",
      collectionName: "rooms",
      displayField: "name",
    },
    {
      name: "assignedTeamId",
      label: "Assigned Team",
      type: "relationship",
      collectionName: "teams",
      displayField: "name",
    },
    {
      name: "reporterModel",
      label: "Reporter Type",
      type: "select",
      options: [
        { label: "Volunteer", value: "Volunteer" },
        { label: "Organizer", value: "Organizer" },
      ],
    },
    {
      name: "reportedById",
      label: "Reported By",
      type: "relationship",
      collectionName: "volunteers",
      displayField: "fullName",
    },
  ];

  const roomFields = [
    { name: "name", label: "Room Name", type: "text" },
    { name: "capacity", label: "Capacity", type: "number" },
    { name: "location", label: "Location", type: "text" },
    { name: "setupStyle", label: "Setup Style", type: "text" },
  ];

  const organizerFields = [
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "organization", label: "Organization", type: "text" },
    { name: "role", label: "Role", type: "text" },
  ];

  const facilityFields = [
    { name: "name", label: "Facility Name", type: "text" },
    { name: "type", label: "Type", type: "text" },
    { name: "address", label: "Address", type: "text" },
    { name: "capacity", label: "Capacity", type: "number" },
    { name: "contactName", label: "Contact Name", type: "text" },
    { name: "contactEmail", label: "Contact Email", type: "email" },
  ];

  const logFields = [
    { name: "method", label: "Method", type: "text" },
    { name: "path", label: "Path", type: "text" },
    { name: "status", label: "Status", type: "number" },
    { name: "duration", label: "Duration", type: "text" },
  ];

  const healthFields = [
    { name: "service", label: "Service", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Operational", value: "Operational" },
        { label: "Degraded", value: "Degraded" },
        { label: "Down", value: "Down" },
      ],
    },
    { name: "uptime", label: "Uptime", type: "text" },
  ];

  const analyticsFields = [
    { name: "name", label: "Metric Name", type: "text" },
    { name: "value", label: "Value", type: "text" },
    { name: "change", label: "Change", type: "text" },
    {
      name: "trend",
      label: "Trend",
      type: "select",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
        { label: "Neutral", value: "neutral" },
      ],
    },
  ];

  if (collection) {
    let viewProps: any = null;
    switch (collection) {
      case "speakers":
        viewProps = { title: "Speakers", collectionName: "speakers", columns: speakerColumns, searchKey: "fullName", fields: speakerFields };
        break;
      case "attendees":
        viewProps = { title: "Attendees", collectionName: "attendees", columns: attendeeColumns, searchKey: "fullName", fields: attendeeFields };
        break;
      case "volunteers":
        viewProps = { title: "Volunteers", collectionName: "volunteers", columns: volunteerColumns, searchKey: "fullName", fields: volunteerFields };
        break;
      case "sponsors":
        viewProps = { title: "Sponsors", collectionName: "sponsors", columns: sponsorColumns, searchKey: "companyName", fields: sponsorFields };
        break;
      case "events":
        viewProps = { title: "Events", collectionName: "events", columns: eventColumns, searchKey: "name", fields: eventFields };
        break;
      case "sessions":
        viewProps = { title: "Sessions", collectionName: "sessions", columns: sessionColumns, searchKey: "title", fields: sessionFields };
        break;
      case "rooms":
        viewProps = { title: "Rooms", collectionName: "rooms", columns: roomColumns, searchKey: "name", fields: roomFields };
        break;
      case "organizers":
        viewProps = { title: "Organizers", collectionName: "organizers", columns: organizerColumns, searchKey: "fullName", fields: organizerFields };
        break;
      case "facilities":
        viewProps = { title: "Facilities", collectionName: "facilities", columns: facilityColumns, searchKey: "name", fields: facilityFields };
        break;
      case "teams":
        viewProps = { title: "Teams", collectionName: "teams", columns: teamColumns, searchKey: "name", fields: teamFields };
        break;
      case "tasks":
        viewProps = { title: "Tasks", collectionName: "tasks", columns: taskColumns, searchKey: "title", fields: taskFields };
        break;
      case "incidents":
        viewProps = { title: "Incidents", collectionName: "incidents", columns: incidentColumns, searchKey: "title", fields: incidentFields };
        break;
      case "logs":
        viewProps = { title: "API Logs", collectionName: "logs", columns: logColumns, searchKey: "path", fields: logFields };
        break;
      case "health":
        viewProps = { title: "System Health", collectionName: "health", columns: healthColumns, searchKey: "service", fields: healthFields };
        break;
      case "analytics":
        viewProps = { title: "Analytics", collectionName: "analytics", columns: analyticsColumns, searchKey: "name", fields: analyticsFields };
        break;
    }

    if (viewProps) {
      viewProps.initialSearchTerm = id || "";
    }

    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/operations"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Data Hub
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {viewProps ? (
              <CollectionView {...viewProps} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Pulse size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Coming Soon
                </h3>
                <p className="mt-2 max-w-xs text-slate-500">
                  The {collection} management interface is currently under
                  development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    {
      title: "People",
      description: "Manage event participants and stakeholders",
      items: [
        {
          id: "speakers",
          name: "Speakers",
          icon: MicrophoneStage,
          count: speakerCount,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "attendees",
          name: "Attendees",
          icon: Users,
          count: attendeeCount,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "volunteers",
          name: "Volunteers",
          icon: Users,
          count: volunteerCount,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "sponsors",
          name: "Sponsors",
          icon: Handshake,
          count: sponsorCount,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "organizers",
          name: "Organizers",
          icon: IdentificationCard,
          count: organizerCount,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ],
    },
    {
      title: "Operations",
      description: "Core logistics and infrastructure",
      items: [
        {
          id: "events",
          name: "Events",
          icon: Calendar,
          count: eventCount,
          color: "text-sky-600",
          bg: "bg-sky-50",
        },
        {
          id: "sessions",
          name: "Sessions",
          icon: Clock,
          count: sessionCount,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          id: "rooms",
          name: "Rooms",
          icon: MapPin,
          count: roomCount,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          id: "facilities",
          name: "Facilities",
          icon: Buildings,
          count: facilityCount,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "teams",
          name: "Teams",
          icon: Briefcase,
          count: teamCount,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "tasks",
          name: "Tasks",
          icon: CheckSquare,
          count: taskCount,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "incidents",
          name: "Incidents",
          icon: Warning,
          count: incidentCount,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ],
    },
    {
      title: "Runtime",
      description: "System health and real-time analytics",
      items: [
        {
          id: "logs",
          name: "API Logs",
          icon: Pulse,
          count: "Live",
          color: "text-slate-600",
          bg: "bg-slate-50",
        },
        {
          id: "health",
          name: "System Health",
          icon: ShieldCheck,
          count: "100%",
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "analytics",
          name: "Analytics",
          icon: ChartLineUp,
          count: "v2.0",
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.05),_transparent_25%),#f8fafc] px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Event Data Hub
            </h1>
            <p className="text-lg text-slate-500">
              Centralized operational control for your event ecosystem.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 ring-inset">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected to MongoDB
            </span>
          </div>
        </header>

        {/* Event Overview Section */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Calendar size={24} weight="bold" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                    Active Event Overview
                  </h2>
                </div>
              </div>

              {latestEvent ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {(latestEvent as any).name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={18} />
                        <span>
                          {(latestEvent as any).venue}, {(latestEvent as any).city}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={18} />
                        <span>
                          {new Date((latestEvent as any).startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="capitalize">{(latestEvent as any).status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Speakers
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {speakerCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Sessions
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {sessionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Volunteers
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {volunteerCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          80% Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-slate-500">
                    No events found. Start by creating your first event.
                  </p>
                  <Link
                    href="?collection=events"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Create Event
                    <CaretRight size={16} weight="bold" />
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden border-l border-slate-100 bg-slate-50/50 p-8 lg:block lg:w-80">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Quick Actions
              </h4>
              <div className="space-y-3">
                <Link
                  href="?collection=events"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Create New Event
                  <CaretRight size={14} />
                </Link>
                <Link
                  href="?collection=speakers"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Add Keynote Speaker
                  <CaretRight size={14} />
                </Link>
                <Link
                  href="?collection=sessions"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Schedule Session
                  <CaretRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Collection Grid */}
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.title} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {category.title}
                </h2>
                <p className="text-slate-500">{category.description}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`?collection=${item.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                      >
                        <item.icon size={28} weight="duotone" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors group-hover:text-indigo-600">
                        Manage collection
                        <CaretRight
                          size={14}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 h-24 w-24 translate-x-8 translate-y-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                      <item.icon size={96} weight="fill" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
