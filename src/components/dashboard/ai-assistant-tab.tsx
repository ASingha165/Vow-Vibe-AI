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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { StorageService } from "@/services/storageService";
import { formatINR } from "@/lib/utils";

interface AiAssistantTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const QUICK_PROMPTS = [
  "How can I save ₹30,000 without compromising catering?",
  "What tasks should I prioritize this week?",
  "What happens if my guest count increases by 50?",
  "Suggest a more affordable floral decoration theme.",
  "Create a checklist for the final 7 days countdown.",
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
    <div className="space-y-6 animate-in fade-in-50">
      <Card className="flex flex-col h-[750px] border border-[#E5D5B5] shadow-lg overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b border-[#FAF0F3] py-4 px-6 flex flex-row items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B1242] text-[#E5D5B5]">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-[#22092C]">Contextual Event Planning Assistant</CardTitle>
              <CardDescription className="text-xs">
                Grounded in &quot;{event.title}&quot; • ₹{event.budget.totalBudget.toLocaleString("en-IN")} • {event.guests.expectedCount} guests
              </CardDescription>
            </div>
          </div>

          <Badge variant="gold" className="text-[10px] hidden sm:inline-flex">
            Context Aware
          </Badge>
        </CardHeader>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8F5]">
          {event.chatHistory.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 rounded-full items-center justify-center shrink-0 ${
                    isUser ? "bg-[#3B1242] text-white" : "bg-white border border-[#E5D5B5] text-[#C5A059]"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#3B1242] text-white shadow-sm rounded-tr-none"
                        : "bg-white text-[#22092C] border border-[#E5D5B5]/80 shadow-xs rounded-tl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.modelUsed && !isUser && (
                      <div className="mt-2 pt-2 border-t border-[#FAF0F3] flex justify-between text-[10px] text-[#7A6B80]">
                        <span>Engine: {msg.modelUsed}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>

                  {/* Proposal Confirmation Card (if AI suggested a plan modification) */}
                  {msg.proposedChanges && (
                    <div className="rounded-2xl border border-[#C5A059] bg-[#FAF4E6] p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-[#8C6D23]">
                        <Lightbulb className="h-4 w-4" />
                        <span>Proposed Plan Modification</span>
                      </div>
                      <p className="text-xs text-[#22092C] font-medium">{msg.proposedChanges.description}</p>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleApplyProposal(msg.proposedChanges!)}
                          className="text-xs gap-1.5 h-8 px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Apply to Plan</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 rounded-full items-center justify-center shrink-0 bg-white border border-[#E5D5B5] text-[#C5A059]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-white border border-[#E5D5B5] p-3 text-xs text-[#5E4B66] flex items-center space-x-2 shadow-xs">
                <Loader2 className="h-4 w-4 animate-spin text-[#C5A059]" />
                <span>Formulating contextual recommendation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Pills */}
        <div className="p-3 bg-white border-t border-[#FAF0F3] overflow-x-auto whitespace-nowrap space-x-2">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 rounded-full border border-[#E5D5B5] bg-[#FAF8F5] text-[11px] font-medium text-[#5E4B66] hover:bg-[#FAF0F3] hover:text-[#3B1242] transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#FAF0F3] flex items-center space-x-2">
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
            className="flex-1 rounded-xl border border-[#E5D5B5] bg-white px-4 py-2.5 text-xs sm:text-sm text-[#22092C] placeholder:text-[#A18F9F] focus:outline-none focus:border-[#3B1242] focus:ring-1 focus:ring-[#3B1242]"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            variant="primary"
            className="gap-1.5 h-10 px-4 shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
