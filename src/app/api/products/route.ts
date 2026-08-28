import { NextRequest, NextResponse } from "next/server";
import { putProducts } from "@/lib/blob";
import { head } from "@vercel/blob";

function getToken() {
  return process.env.BURBONE_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
}

export async function GET() {
  const token = getToken();
  try {
    const meta = await head("products.json", token ? { token } : {});
    const res = await fetch(meta.url, token ? { headers: { Authorization: `Bearer ${token}` } } as never : undefined);
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(await res.json());
  } catch {
    // fallback to empty catalog
    return NextResponse.json([]);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await putProducts(body);
    return NextResponse.json({ ok: true, url: result.url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
