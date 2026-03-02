import { statsService } from "@/lib/stats-service";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await statsService.getTodayStats();
  return NextResponse.json(data);
}
