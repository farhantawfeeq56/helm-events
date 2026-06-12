"use client";

import {
  House,
  User,
  Database,
  WarningOctagon,
  ClipboardText,
  Calendar,
  Bell,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useWorkspace } from "@/lib/context/workspace-context";
import { WorkspaceSwitcher } from "./workspace-switcher";

const organizerItems = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Agent",
    url: "/agent",
    icon: User,
  },
  {
    title: "Incidents",
    url: "/incidents",
    icon: WarningOctagon,
  },
  {
    title: "Event data",
    url: "/operations",
    icon: Database,
  },
];

const volunteerItems = [
  {
    title: "Dashboard",
    url: "/volunteer",
    icon: House,
  },
  {
    title: "My Shifts",
    url: "/volunteer/shifts",
    icon: Calendar,
  },
  {
    title: "Tasks",
    url: "/volunteer/tasks",
    icon: ClipboardText,
  },
  {
    title: "Incidents",
    url: "/volunteer/incidents",
    icon: WarningOctagon,
  },
  {
    title: "Notifications",
    url: "/volunteer/notifications",
    icon: Bell,
  },
];

export function AppSidebar() {
  const { workspace } = useWorkspace();
  const items = workspace === "organizer" ? organizerItems : volunteerItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center px-4 py-2">
          <span className="font-semibold text-sidebar-foreground">Helm</span>
        </div>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {workspace === "organizer" ? "Organizer Workspace" : "Volunteer Workspace"}
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
    </Sidebar>
  );
}
