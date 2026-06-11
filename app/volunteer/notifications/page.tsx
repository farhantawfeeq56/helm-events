"use client";

import React, { useState } from "react";
import { NotificationFeed } from "@/components/operations/notification-feed";
import { Bell, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VolunteerNotificationsPage() {
  const recipient = "Volunteer User";
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Trash className="w-4 h-4" />
            Clear History
          </Button>
        </div>
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
