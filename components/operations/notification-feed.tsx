"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/data-hub";
import { NotificationItem } from "./notification-item";
import { BellSlash, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface NotificationFeedProps {
  recipient: string;
  limit?: number;
  onNewNotificationCount?: (count: number) => void;
}

export function NotificationFeed({ recipient, limit = 20, onNewNotificationCount }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?recipient=${encodeURIComponent(recipient)}&limit=${limit}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [recipient, limit]);

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (onNewNotificationCount) {
      onNewNotificationCount(unreadCount);
    }
  }, [notifications, onNewNotificationCount]);

  useEffect(() => {
    // Use a timeout to avoid synchronous setState during effect
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(unreadIds.map(id => 
        fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      ));
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2">
        <Spinner className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <BellSlash className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No notifications</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          We&apos;ll notify you when something important happens.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Signals
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] h-7 px-2"
          onClick={handleMarkAllAsRead}
          disabled={notifications.every(n => n.read)}
        >
          Mark all as read
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification._id} 
            notification={notification} 
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
