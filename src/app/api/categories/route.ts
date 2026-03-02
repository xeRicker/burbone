import { jsonDb } from "@/lib/json-db";
import { NextResponse } from "next/server";

export async function GET() {
  const allCategories = await jsonDb.getCategories();
  const activeCategories = allCategories.filter((c: any) => c.isActive !== false);
  return NextResponse.json(activeCategories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const categories = await jsonDb.getCategories();
  const newId = Math.max(0, ...categories.map((c: any) => c.id)) + 1;
  const newCategory = { 
    id: newId,
    name: body.name,
    icon: body.icon || "Tag",
    color: body.color || "#8E44AD",
    isActive: true
  };
  categories.push(newCategory);
  await jsonDb.saveCategories(categories);
  return NextResponse.json(newCategory);
}
