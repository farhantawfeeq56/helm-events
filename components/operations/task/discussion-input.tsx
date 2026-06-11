"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, PaperPlaneRight, X } from "@phosphor-icons/react";

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface DiscussionInputProps {
  onSendMessage: (content: string, attachments: Attachment[]) => Promise<void>;
  disabled?: boolean;
}

export function DiscussionInput({ onSendMessage, disabled }: DiscussionInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(content, attachments);
      setContent("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const simulateFileUpload = () => {
    // In a real app, this would open a file picker and upload to S3/GCS
    const mockFile = {
      name: `attachment-${Math.random().toString(36).substring(7)}.pdf`,
      url: "#",
      type: "application/pdf",
    };
    setAttachments([...attachments, mockFile]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 p-4 bg-white border-t border-slate-200">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            className="min-h-[44px] max-h-[200px] py-3 pr-12 rounded-2xl border-slate-200 focus-visible:ring-indigo-500 resize-none font-medium text-slate-600"
          />
          <button
            type="button"
            onClick={simulateFileUpload}
            disabled={disabled || isSending}
            className="absolute right-3 bottom-3 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-50"
          >
            <Paperclip size={20} weight="bold" />
          </button>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || isSending || (!content.trim() && attachments.length === 0)}
          className="h-11 w-11 rounded-2xl bg-slate-900 hover:bg-indigo-600 shrink-0 transition-all active:scale-95 shadow-md"
        >
          <PaperPlaneRight size={20} weight="bold" />
        </Button>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
