"use client";

import { useState, useMemo } from "react";
import { 
  AddressBook, 
  MagnifyingGlass, 
  EnvelopeSimple, 
  Phone, 
  ChatCircleText
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
  email: string;
  phone: string;
  status: "Available" | "On-site" | "Busy" | "Off-duty";
  avatarUrl?: string;
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Volunteer Coordinator",
    email: "sarah.j@helmevents.com",
    phone: "+1 (555) 123-4567",
    status: "On-site",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Venue Lead",
    email: "m.chen@helmevents.com",
    phone: "+1 (555) 234-5678",
    status: "On-site",
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    role: "Registration Lead",
    email: "elena.r@helmevents.com",
    phone: "+1 (555) 345-6789",
    status: "Available",
  },
  {
    id: "4",
    name: "David Park",
    role: "Sponsor Lead",
    email: "d.park@helmevents.com",
    phone: "+1 (555) 456-7890",
    status: "Busy",
  },
  {
    id: "5",
    name: "Marcus Thorne",
    role: "Incident Commander",
    email: "m.thorne@helmevents.com",
    phone: "+1 (555) 567-8901",
    status: "On-site",
  },
  {
    id: "6",
    name: "Jessica Wu",
    role: "Volunteer Coordinator",
    email: "j.wu@helmevents.com",
    phone: "+1 (555) 678-9012",
    status: "Off-duty",
  },
];

export default function VolunteerDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "On-site":
        return "bg-emerald-500";
      case "Available":
        return "bg-blue-500";
      case "Busy":
        return "bg-amber-500";
      case "Off-duty":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Incident Commander":
        return "destructive";
      case "Volunteer Coordinator":
        return "secondary";
      default:
        return "outline";
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
          <p className="text-slate-500">Quickly find and contact event leads and coordinators.</p>
        </div>
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

      {filteredContacts.length === 0 ? (
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
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border border-slate-100">
                        {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} />}
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold text-lg">
                          {contact.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                        {contact.name}
                      </CardTitle>
                      <Badge variant={getRoleBadgeVariant(contact.role)} className="mt-1 font-medium text-[10px] uppercase tracking-wider">
                        {contact.role}
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
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span>{contact.phone}</span>
                  </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
