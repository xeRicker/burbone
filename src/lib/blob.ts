import { put, list, del, head } from "@vercel/blob";

function getToken(): string | undefined {
  return (
    process.env.BURBONE_READ_WRITE_TOKEN ??
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.BURBONE_TOKEN
  );
}

export function getBlobToken() {
  const t = getToken();
  if (!t) console.warn("BURBONE_READ_WRITE_TOKEN missing - Blob calls will fail in prod");
  return t;
}

// key helpers - keep Polish chars (Oświęcim) as-is, do not normalize
export function reportKey(location: string, dateKey: string) {
  // dateKey = dd.mm.yyyy
  return `reports/${location}/${dateKey}.json`;
}
export function productsKey() {
  return `products.json`;
}

export async function putReport(location: string, dateKey: string, data: unknown) {
  const token = getBlobToken();
  const key = reportKey(location, dateKey);
  return put(key, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    ...(token ? { token } : {}),
  });
}

export async function getReport(location: string, dateKey: string) {
  const token = getBlobToken();
  const key = reportKey(location, dateKey);
  try {
    const meta = await head(key, token ? { token } : {});
    const res = await fetch(meta.url, token ? { headers: { Authorization: `Bearer ${token}` } } as never : undefined);
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

export async function listReports(opts?: { location?: string; prefix?: string; limit?: number }) {
  const token = getBlobToken();
  const prefix = opts?.prefix ?? (opts?.location ? `reports/${opts.location}/` : "reports/");
  const result = await list({
    prefix,
    limit: opts?.limit ?? 1000,
    ...(token ? { token } : {}),
  });
  return result.blobs;
}

export async function deleteReport(location: string, dateKey: string) {
  const token = getBlobToken();
  const key = reportKey(location, dateKey);
  // list then del by url
  const blobs = await list({ prefix: key, ...(token ? { token } : {}) });
  const match = blobs.blobs.find((b) => b.pathname === key);
  if (match) await del(match.url, token ? { token } : {});
}

export async function putProducts(data: unknown) {
  const token = getBlobToken();
  return put(productsKey(), JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    ...(token ? { token } : {}),
  });
}

export async function listAllReportsForAnalytics(limit = 3000) {
  return listReports({ limit });
}
