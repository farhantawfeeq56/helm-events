import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationPanel } from "@/components/operations/notification-panel";
import { AuthProvider, type AuthUser } from "@/lib/context/auth-context";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Helm Events Ops Console",
  description: "Minimal event operations data layer for AI-powered workflows.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const user: AuthUser | null = session
    ? { email: session.email, role: session.role, name: session.name }
    : null;

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
        <AuthProvider user={user}>
          {user ? (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                  </div>
                  <div className="flex items-center gap-4">
                    <NotificationPanel recipient={user.name} />
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
