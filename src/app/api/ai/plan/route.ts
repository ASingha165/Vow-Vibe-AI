import { NextResponse } from "next/server";
import { EventWizardSchema } from "@/types/event";
import { AiService } from "@/services/aiService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = EventWizardSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { plan, providerUsed } = await AiService.generateEventPlan(parseResult.data);

    return NextResponse.json({
      success: true,
      plan,
      providerUsed,
    });
  } catch (err: any) {
    console.error("API /api/ai/plan error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while synthesizing plan.",
      },
      { status: 500 }
    );
  }
}
