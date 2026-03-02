import { statsService } from "@/lib/stats-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const locationId = searchParams.get("locationId");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  const data = await statsService.getWorkLogs(
    from, 
    to, 
    locationId === "all" ? "all" : (locationId ? Number(locationId) : "all")
  );
  return NextResponse.json(data);
}
