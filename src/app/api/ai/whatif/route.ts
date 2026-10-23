import { NextResponse } from "next/server";
import { runWhatIfSimulation } from "@/services/budgetEngine";
import { WhatIfSimulationInput } from "@/types/event";

export async function POST(req: Request) {
  try {
    const { baseBudget, baseGuests, simulationInput } = await req.json();

    if (!baseBudget || !baseGuests || !simulationInput) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters for simulation." },
        { status: 400 }
      );
    }

    const result = runWhatIfSimulation(
      Number(baseBudget),
      Number(baseGuests),
      simulationInput as WhatIfSimulationInput
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("API /api/ai/whatif error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to run simulation." },
      { status: 500 }
    );
  }
}
