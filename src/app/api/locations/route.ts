import { jsonDb } from "@/lib/json-db";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await jsonDb.getLocations();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newLocation = await jsonDb.addLocation(body);
  return NextResponse.json(newLocation);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
  }

  const success = await jsonDb.updateLocation(Number(id), data);
  if (success) {
    return NextResponse.json({ message: "Location updated successfully" });
  } else {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
  }

  await jsonDb.deleteLocation(Number(id));
  return NextResponse.json({ message: "Location deleted successfully" });
}
