import { statsService } from "@/lib/stats-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  const data = await statsService.getRankings(from, to);
  return NextResponse.json(data);
}
