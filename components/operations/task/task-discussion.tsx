"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TaskMessage } from "@/types/data-hub";
import { MessageBubble } from "./message-bubble";
import { DiscussionInput } from "./discussion-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatCircleDots, ArrowsClockwise } from "@phosphor-icons/react";

interface TaskDiscussionProps {
  taskId: string;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

export function TaskDiscussion({ taskId, currentUser }: TaskDiscussionProps) {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const markAsRead = useCallback(async () => {
    try {
      await fetch(`/api/tasks/${taskId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, [taskId, currentUser.id]);

  const fetchMessages = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        markAsRead();
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, markAsRead]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMessages(false);
    }, 0);
    const interval = setInterval(() => fetchMessages(false), 10000); // Poll every 10s
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    try {
      // Basic mention extraction
      const mentions = content.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];

      const response = await fetch(`/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: currentUser,
          content,
          attachments,
          mentions,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isMessageReadByOthers = (message: TaskMessage) => {
    if (!message.readBy) return false;
    return message.readBy.some((read) => read.userId !== currentUser.id);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <ChatCircleDots size={18} weight="bold" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Task Discussion</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {messages.length} Messages
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchMessages(true)}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowsClockwise size={18} weight="bold" className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        {isLoading && messages.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className={`space-y-2 max-w-[70%] ${i % 2 === 0 ? "items-end" : ""}`}>
                  <Skeleton className="h-16 w-48 rounded-2xl" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="p-4 bg-white rounded-full border border-slate-200 shadow-sm">
              <ChatCircleDots size={32} weight="bold" className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-900">No messages yet</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">
                Start the discussion about this task
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const isMe = message.sender.id === currentUser.id;
              const showSender = !prevMessage || prevMessage.sender.id !== message.sender.id;
              const isRead = isMessageReadByOthers(message);

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isMe={isMe}
                  showSender={showSender}
                  isRead={isRead}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>

      <DiscussionInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
