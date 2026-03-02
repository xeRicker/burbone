import { jsonDb } from "@/lib/json-db";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await jsonDb.getEmployees();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newEmployee = await jsonDb.addEmployee(body);
  return NextResponse.json(newEmployee);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  const success = await jsonDb.updateEmployee(Number(id), data);
  if (success) {
    return NextResponse.json({ message: "Employee updated successfully" });
  } else {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  await jsonDb.deleteEmployee(Number(id));
  return NextResponse.json({ message: "Employee deleted successfully" });
}
