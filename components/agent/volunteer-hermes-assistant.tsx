"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkle,
  ArrowUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAgent } from "@/hooks/use-agent";
import { VolunteerMessageItem, VolunteerTypingIndicator } from "./volunteer-message-item";
import { volunteerActions } from "@/lib/constants";

export function VolunteerHermesAssistant({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    isTyping, 
    handleSendMessage, 
  } = useAgent("volunteer");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const onSend = (text: string) => {
    if (!text.trim()) return;
    handleSendMessage(text);
    setInput("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {variant === "floating" ? (
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-slate-900 shadow-2xl hover:bg-sky-600 transition-all duration-300 z-50 group"
          >
            <Sparkle size={28} weight="fill" className="text-sky-400 group-hover:rotate-12 transition-transform" />
          </Button>
        ) : (
          <Button 
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl h-12 flex items-center gap-2 group transition-all"
          >
            <Sparkle size={20} weight="fill" className="text-sky-200 group-hover:rotate-12 transition-transform" />
            Open Hermes Assistant
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col border-l border-slate-200">
        <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                <Sparkle size={20} weight="fill" className="text-sky-400" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black tracking-tighter text-slate-900">
                  HERMES<span className="text-sky-600">.HELP</span>
                </SheetTitle>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volunteer Assistant</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">How can I help you today?</h3>
                <p className="text-sm text-slate-500 font-medium leading-snug">
                  I can help with issue reporting, location info, and task assistance.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {volunteerActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => onSend(action.message)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-sky-400 hover:shadow-md group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600">
                      <action.icon size={20} weight="duotone" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-4">
              {messages.map((message) => (
                <VolunteerMessageItem 
                  key={message.id} 
                  message={message} 
                />
              ))}
              {isTyping && <VolunteerTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-50 transition-all">
            <Textarea
              ref={textareaRef}
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(input);
                }
              }}
              className="min-h-[44px] max-h-32 w-full resize-none border-none bg-transparent px-2 py-2.5 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-0"
            />
            <Button
              onClick={() => onSend(input)}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 text-white hover:bg-sky-600 disabled:bg-slate-200 transition-all"
            >
              <ArrowUp size={20} weight="bold" />
            </Button>
          </div>
          <p className="mt-3 text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
            AI-Powered Support Line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
