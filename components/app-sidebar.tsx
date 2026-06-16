"use client";

import {
  House,
  User,
  Database,
  WarningOctagon,
  ClipboardText,
  Calendar,
  Bell,
  AddressBook,
  SignOut,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";

const organizerItems = [
  { title: "Home", url: "/", icon: House },
  { title: "Agent", url: "/agent", icon: User },
  { title: "Incidents", url: "/incidents", icon: WarningOctagon },
  { title: "Event data", url: "/operations", icon: Database },
];

const volunteerItems = [
  { title: "Dashboard", url: "/volunteer", icon: House },
  { title: "My Shifts", url: "/volunteer/shifts", icon: Calendar },
  { title: "Tasks", url: "/volunteer/tasks", icon: ClipboardText },
  { title: "Incidents", url: "/volunteer/incidents", icon: WarningOctagon },
  { title: "Notifications", url: "/volunteer/notifications", icon: Bell },
  { title: "Directory", url: "/volunteer/directory", icon: AddressBook },
];

export function AppSidebar() {
  const user = useAuth();
  const isOrganizer = user?.role === "organizer";
  const items = isOrganizer ? organizerItems : volunteerItems;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigation so the cleared cookie is picked up by a fresh server request.
    window.location.assign("/login");
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center px-4 py-2">
          <span className="font-semibold text-sidebar-foreground">Helm</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isOrganizer ? "Organizer Workspace" : "Volunteer Workspace"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50">
        {user && (
          <div className="px-2 py-1.5">
            <div className="mb-1 truncate text-sm font-semibold text-sidebar-foreground">
              {user.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <SignOut size={20} />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
