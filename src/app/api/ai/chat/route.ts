import { NextResponse } from "next/server";
import { AiService } from "@/services/aiService";
import { EventPlan } from "@/types/event";

export async function POST(req: Request) {
  try {
    const { event, message } = await req.json();

    if (!event || !message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid payload: 'event' and 'message' are required." },
        { status: 400 }
      );
    }

    const { message: replyMessage, providerUsed } = await AiService.chatWithAssistant(event as EventPlan, message);

    return NextResponse.json({
      success: true,
      message: replyMessage,
      providerUsed,
    });
  } catch (err: any) {
    console.error("API /api/ai/chat error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate chat response." },
      { status: 500 }
    );
  }
}
