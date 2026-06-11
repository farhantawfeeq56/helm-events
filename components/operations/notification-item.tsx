"use client";

import React from "react";
import { 
  CheckCircle, 
  Warning, 
  Info, 
  UserPlus, 
  ArrowsClockwise,
  WarningCircle
} from "@phosphor-icons/react";
import { Notification } from "@/types/data-hub";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getNotificationIcon = (type: Notification["type"], priority: Notification["priority"]) => {
  if (priority === "urgent") return <WarningCircle className="w-5 h-5 text-destructive" weight="fill" />;
  
  switch (type) {
    case "task_assigned":
      return <UserPlus className="w-5 h-5 text-blue-500" weight="bold" />;
    case "task_updated":
      return <ArrowsClockwise className="w-5 h-5 text-orange-500" weight="bold" />;
    case "task_completed":
      return <CheckCircle className="w-5 h-5 text-green-500" weight="bold" />;
    case "task_escalated":
      return <Warning className="w-5 h-5 text-destructive" weight="fill" />;
    case "system_alert":
      return <WarningCircle className="w-5 h-5 text-destructive" weight="bold" />;
    default:
      return <Info className="w-5 h-5 text-muted-foreground" weight="bold" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const isUnread = !notification.read;

  const content = (
    <div className={cn(
      "flex gap-3 p-4 transition-colors hover:bg-muted/50",
      isUnread && "bg-muted/20 border-l-2 border-primary"
    )}>
      <div className="mt-1">
        {getNotificationIcon(notification.type, notification.priority)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-medium leading-none", isUnread && "font-bold")}>
            {notification.title}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-end gap-2 pt-1">
          {isUnread && onMarkAsRead && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Mark as read
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(notification._id);
              }}
              className="text-[10px] font-medium text-muted-foreground hover:text-destructive hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block no-underline">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}
