"use client";

import React, { useState } from "react";
import { NotificationFeed } from "@/components/operations/notification-feed";
import { Bell } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/context/auth-context";

export default function VolunteerNotificationsPage() {
  const user = useAuth();
  // Notifications are keyed by recipient name (same identity used for tasks,
  // shifts and acknowledgements). Fall back to a harmless placeholder until the
  // session resolves so the feed simply shows the empty state.
  const recipient = user?.name || "Volunteer";
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
      </div>

      <div className="grid gap-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" weight="fill" />
              All Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount} new
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[400px]">
              <NotificationFeed 
                recipient={recipient} 
                limit={50}
                onNewNotificationCount={setUnreadCount}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
