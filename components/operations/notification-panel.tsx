"use client";

import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Bell } from "@phosphor-icons/react";
import { NotificationFeed } from "./notification-feed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationPanelProps {
  recipient: string;
}

export function NotificationPanel({ recipient }: NotificationPanelProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted focus-visible:ring-0"
        >
          <Bell size={24} weight={unreadCount > 0 ? "fill" : "regular"} className={cn(
            unreadCount > 0 && "text-primary"
          )} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Bell size={20} weight="bold" />
              Notifications
            </SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <NotificationFeed 
            recipient={recipient} 
            onNewNotificationCount={setUnreadCount} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
