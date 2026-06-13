"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  AddressBook, 
  MagnifyingGlass, 
  EnvelopeSimple, 
  Phone, 
  ChatCircleText,
  CircleNotch
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Contact {
  id: string;
  name: string;
  role: string;
  roleCategory: "volunteer" | "organizer" | "speaker" | "sponsor";
  email: string;
  phone: string;
  status: string;
  shift?: string;
  avatarUrl?: string;
}

export default function VolunteerDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllContacts() {
      try {
        setIsLoading(true);
        setError(null);

        const [volunteersRes, organizersRes, speakersRes, sponsorsRes] = await Promise.all([
          fetch("/api/volunteers?limit=100"),
          fetch("/api/organizers?limit=100"),
          fetch("/api/speakers?limit=100"),
          fetch("/api/sponsors?limit=100"),
        ]);

        const [volunteersData, organizersData, speakersData, sponsorsData] = await Promise.all([
          volunteersRes.json(),
          organizersRes.json(),
          speakersRes.json(),
          sponsorsRes.json(),
        ]);

        const allContacts: Contact[] = [];

        if (volunteersData.success) {
          volunteersData.data.forEach((v: { _id: string; fullName: string; email: string; phone?: string; role: string; status: string; shift?: string }) => {
            allContacts.push({
              id: v._id,
              name: v.fullName,
              role: v.role || "Volunteer",
              roleCategory: "volunteer",
              email: v.email,
              phone: v.phone || "No phone provided",
              status: v.status || "Available",
              shift: v.shift,
            });
          });
        }

        if (organizersData.success) {
          organizersData.data.forEach((o: { _id: string; fullName: string; email: string; phone?: string; role?: string; organization?: string }) => {
            allContacts.push({
              id: o._id,
              name: o.fullName,
              role: o.role || o.organization || "Organizer",
              roleCategory: "organizer",
              email: o.email,
              phone: o.phone || "No phone provided",
              status: "Active",
            });
          });
        }

        if (speakersData.success) {
          speakersData.data.forEach((s: { _id: string; fullName: string; email: string; topic?: string; company?: string; status?: string }) => {
            allContacts.push({
              id: s._id,
              name: s.fullName,
              role: s.topic || s.company || "Speaker",
              roleCategory: "speaker",
              email: s.email,
              phone: "No phone provided",
              status: s.status || "Pending",
            });
          });
        }

        if (sponsorsData.success) {
          sponsorsData.data.forEach((s: { _id: string; companyName: string; email?: string; tier: string; contact?: string; status?: string }) => {
            allContacts.push({
              id: s._id,
              name: s.companyName,
              role: `${s.tier} Sponsor${s.contact ? ` — ${s.contact}` : ""}`,
              roleCategory: "sponsor",
              email: s.email || "No email provided",
              phone: "No phone provided",
              status: s.status || "Active",
            });
          });
        }

        setContacts(allContacts);
      } catch (err) {
        setError("An error occurred while fetching contacts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, contacts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "On-site":
      case "Confirmed":
        return "bg-emerald-500";
      case "Available":
        return "bg-blue-500";
      case "Busy":
        return "bg-amber-500";
      case "Off-duty":
      case "Inactive":
      case "Pending":
      case "Withdrawn":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  const getRoleCategoryBadge = (category: Contact["roleCategory"]) => {
    switch (category) {
      case "volunteer":
        return { label: "Volunteer", className: "bg-indigo-100 text-indigo-700 border-indigo-200" };
      case "organizer":
        return { label: "Organizer", className: "bg-rose-100 text-rose-700 border-rose-200" };
      case "speaker":
        return { label: "Speaker", className: "bg-cyan-100 text-cyan-700 border-cyan-200" };
      case "sponsor":
        return { label: "Sponsor", className: "bg-amber-100 text-amber-700 border-amber-200" };
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <AddressBook className="text-indigo-600" />
            Contacts Directory
          </h1>
          <p className="text-slate-500">All event contacts — volunteers, organizers, speakers, and sponsors.</p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1.5">
            {contacts.length} contacts
          </Badge>
        )}
      </header>

      <div className="relative max-w-md">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Search by name or role..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <CircleNotch size={48} className="animate-spin mb-4" />
          <p>Loading directory...</p>
        </div>
      ) : error ? (
        <Card className="border-red-100 bg-red-50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-red-900">Error loading contacts</h3>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card className="border-dashed py-16 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <MagnifyingGlass size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No contacts found</h3>
            <p className="text-sm text-slate-500 max-w-[240px] mt-2">
              Try adjusting your search to find the person you&apos;re looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => {
            const catBadge = getRoleCategoryBadge(contact.roleCategory);

            return (
              <Card key={contact.id} className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border border-slate-100">
                          {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} />}
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold text-lg">
                            {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                          {contact.name}
                        </CardTitle>
                        <Badge variant="outline" className={catBadge.className + " mt-1 font-medium text-[10px] uppercase tracking-wider"}>
                          {catBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-500">
                      {contact.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <EnvelopeSimple size={16} className="text-slate-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.shift && (
                      <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-2">
                        <CircleNotch size={14} />
                        <span className="font-medium">Shift: {contact.shift}</span>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">{contact.role}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full flex flex-col h-auto py-2 gap-1" asChild>
                      <a href={`mailto:${contact.email}`}>
                        <EnvelopeSimple size={18} />
                        <span className="text-[10px]">Message</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full flex flex-col h-auto py-2 gap-1" asChild>
                      <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}>
                        <Phone size={18} />
                        <span className="text-[10px]">Call</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full flex flex-col h-auto py-2 gap-1">
                      <ChatCircleText size={18} />
                      <span className="text-[10px]">Discuss</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}