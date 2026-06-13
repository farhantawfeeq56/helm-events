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
    async function fetchVolunteers() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/volunteers?limit=100");
        const data = await response.json();
        
        if (data.success) {
          const mappedContacts: Contact[] = data.data.map((v: any) => ({
            id: v._id,
            name: v.fullName,
            role: v.role,
            email: v.email,
            phone: v.phone || "No phone provided",
            status: v.status || "Available",
            shift: v.shift,
          }));
          setContacts(mappedContacts);
        } else {
          setError(data.error || "Failed to fetch volunteers");
        }
      } catch (err) {
        setError("An error occurred while fetching volunteers");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVolunteers();
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
        return "bg-emerald-500";
      case "Available":
        return "bg-blue-500";
      case "Busy":
        return "bg-amber-500";
      case "Off-duty":
      case "Inactive":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes("Commander") || role.includes("Lead")) {
      return "destructive";
    }
    if (role.includes("Coordinator")) {
      return "secondary";
    }
    return "outline";
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
