import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationPanel } from "@/components/operations/notification-panel";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Helm Events Ops Console",
  description: "Minimal event operations data layer for AI-powered workflows.",
};

import { WorkspaceProvider } from "@/lib/context/workspace-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        instrumentSans.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full">
        <WorkspaceProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                </div>
                <div className="flex items-center gap-4">
                  <NotificationPanel recipient="Volunteer User" />
                </div>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
