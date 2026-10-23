"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  Info,
} from "lucide-react";
import { EventPlan, ChatMessage, PlanChangeProposal } from "@/types/event";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { StorageService } from "@/services/storageService";
import { formatINR } from "@/lib/utils";

interface AiAssistantTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const QUICK_PROMPTS = [
  "How can I optimize catering costs without reducing feast quality?",
  "What tasks should I prioritize for this week?",
  "Suggest a culturally authentic floral decoration theme.",
  "What happens if my guest count shifts by +50?",
  "Generate a 7-day countdown checklist.",
];

export function AiAssistantTab({ event, onUpdateEvent }: AiAssistantTabProps) {
  const { toast } = useToast();

  const [inputMessage, setInputMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [event.chatHistory, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...event.chatHistory, userMsg];

    // Optimistically update
    const updatedEvent: EventPlan = {
      ...event,
      chatHistory: updatedHistory,
    };
    onUpdateEvent(updatedEvent);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          message: text,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.message) {
        throw new Error(data.error || "Failed to receive response from assistant.");
      }

      const finalEvent: EventPlan = {
        ...event,
        chatHistory: [...updatedHistory, data.message],
      };

      onUpdateEvent(finalEvent);
      StorageService.saveEvent(finalEvent);
    } catch (err: any) {
      console.error("AI Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `chat-err-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an issue analyzing your request. Please try asking again.",
        timestamp: new Date().toISOString(),
        isAiGenerated: true,
        modelUsed: "Fallback Handler",
      };
      const finalEvent = {
        ...event,
        chatHistory: [...updatedHistory, errorMsg],
      };
      onUpdateEvent(finalEvent);
      toast({ type: "error", title: "Assistant Error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit confirmation before applying plan changes
  const handleApplyProposal = (proposal: PlanChangeProposal) => {
    if (proposal.type === "update_budget" && proposal.details.suggestedSavings) {
      const savings = Number(proposal.details.suggestedSavings);
      // Transfer savings into emergency reserve
      const updatedEvent: EventPlan = {
        ...event,
        budget: {
          ...event.budget,
          emergencyReserveAmount: event.budget.emergencyReserveAmount + savings,
        },
      };
      onUpdateEvent(updatedEvent);
      StorageService.saveEvent(updatedEvent);
      toast({
        type: "success",
        title: "Budget Adjusted",
        message: `Transferred ${formatINR(savings)} into your Emergency Reserve.`,
      });
    } else {
      toast({
        type: "info",
        title: "Proposal Acknowledged",
        message: proposal.description,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col h-[750px] rounded-2xl bg-surface-container-lowest border border-primary-container/10 shadow-sm overflow-hidden">
        {/* Stitch Assistant Header */}
        <div className="border-b border-surface-container py-3.5 px-6 flex flex-row items-center justify-between shrink-0 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-[20px] text-secondary-container">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-primary">Contextual Event Planning Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                  Live Engine
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant">
                Context: &ldquo;{event.title}&rdquo; • {formatINR(event.budget.totalBudget)} • {event.guests.expectedCount} attendees
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-surface-container text-secondary text-[11px] font-semibold hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Grounded in Active Event Data</span>
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-container-low/30">
          {event.chatHistory.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 rounded-full items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-container text-secondary border border-primary-container/10"
                  }`}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-primary-container text-on-primary rounded-tr-none shadow-xs font-sans"
                        : "bg-surface-container-lowest text-primary border border-primary-container/10 rounded-tl-none shadow-xs font-sans"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.modelUsed && !isUser && (
                      <div className="mt-2.5 pt-2 border-t border-surface-container flex justify-between text-[10px] text-on-surface-variant">
                        <span>Engine: {msg.modelUsed}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>

                  {/* Proposal Confirmation Card */}
                  {msg.proposedChanges && (
                    <div className="rounded-2xl border border-secondary bg-secondary-container/20 p-4 space-y-2.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Proposed Plan Optimization</span>
                      </div>
                      <p className="font-sans text-xs text-primary leading-relaxed font-medium">
                        {msg.proposedChanges.description}
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApplyProposal(msg.proposedChanges!)}
                          className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary-container" />
                          <span>Apply to Plan</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 rounded-full items-center justify-center shrink-0 bg-surface-container text-secondary border border-primary-container/10">
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              </div>
              <div className="rounded-2xl rounded-tl-none bg-surface-container-lowest border border-primary-container/10 p-3.5 text-xs text-on-surface-variant flex items-center gap-2 shadow-xs">
                <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                <span>Formulating contextual recommendation grounded in your budget...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips Ribbon */}
        <div className="p-2.5 bg-surface-container-lowest border-t border-surface-container overflow-x-auto whitespace-nowrap space-x-1.5 no-scrollbar flex items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant pl-1 mr-1">
            Quick Ideas:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-[11px] font-medium text-primary hover:bg-secondary-container/40 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-surface-container-lowest border-t border-surface-container flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about budget, vendor negotiation, or rituals..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1 rounded-full border border-primary-container/20 bg-surface px-4 py-2.5 text-xs sm:text-sm text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-container"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-sm"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

