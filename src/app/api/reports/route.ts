import { NextRequest, NextResponse } from "next/server";
import { putReport, listReports } from "@/lib/blob";

// GET /api/reports?location=Oświęcim&date=28.08.2026
// GET /api/reports?location=Oświęcim
// GET /api/reports (all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const recentMonths = Number(searchParams.get("recentMonths") ?? 0);

  try {
    if (date && location) {
      // single report - fetch via blob head+fetch
      const { getReport } = await import("@/lib/blob");
      const data = await getReport(location, date);
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    const blobs = await listReports({ location, limit: 3000 });

    // optional filter by recent months (like dev-server.js:104)
    let filtered = blobs;
    if (recentMonths > 0) {
      const now = new Date();
      const keys = new Set(
        Array.from({ length: recentMonths }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })
      );
      const getKey = (pathname: string) => {
        // pathname reports/Osiek/28.08.2026.json -> month 2026-08
        const m = pathname.match(/(\d{2})\.(\d{2})\.(\d{4})\.json$/);
        if (!m) return "";
        return `${m[3]}-${m[2]}`;
      };
      filtered = blobs.filter((b) => keys.has(getKey(b.pathname)));
    }

    // For analytics we need actual JSON content - fetch each blob (private needs token)
    const token = process.env.BURBONE_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
    const results: unknown[] = [];
    for (const b of filtered) {
      try {
        const res = await fetch(b.url, token ? { headers: { Authorization: `Bearer ${token}` } } as never : undefined);
        if (res.ok) results.push(await res.json());
      } catch {}
    }
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PUT /api/reports  { location, date: "28.08.2026", ...report }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const location = body.location as string | undefined;
    const date = body.date as string | undefined;
    if (!location || !date) {
      return NextResponse.json({ error: "location and date required (dd.mm.yyyy)" }, { status: 400 });
    }
    const result = await putReport(location, date, body);
    return NextResponse.json({ ok: true, url: result.url, pathname: result.pathname });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
