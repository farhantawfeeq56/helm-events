"use client";

import { TaskMessage } from "@/types/data-hub";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { File, CheckCircle } from "@phosphor-icons/react";

interface MessageBubbleProps {
  message: TaskMessage;
  isMe: boolean;
  showSender: boolean;
  isRead: boolean;
}

export function MessageBubble({ message, isMe, showSender, isRead }: MessageBubbleProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "commander":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "lead":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "volunteer":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 mb-1",
        isMe ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex-shrink-0 w-8">
        {showSender && !isMe && (
          <Avatar className="h-8 w-8 border border-slate-200">
            <AvatarFallback className="text-[10px] font-black">
              {getInitials(message.sender.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isMe ? "items-end" : "items-start"
        )}
      >
        {showSender && !isMe && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-black uppercase tracking-tight text-slate-900">
              {message.sender.name}
            </span>
            <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-4 font-black uppercase tracking-widest", getRoleColor(message.sender.role))}>
              {message.sender.role}
            </Badge>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm shadow-sm border",
            isMe
              ? "bg-slate-900 text-white border-slate-900 rounded-tr-none"
              : "bg-white text-slate-600 border-slate-200 rounded-tl-none"
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors",
                    isMe
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-500"
                  )}
                >
                  <File size={14} weight="bold" />
                  <span className="truncate font-bold uppercase tracking-tight">{file.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && isRead && (
            <CheckCircle size={12} weight="fill" className="text-indigo-500" />
          )}
        </div>
      </div>
    </div>
  );
}
