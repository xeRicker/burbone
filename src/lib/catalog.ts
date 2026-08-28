export type ProductItem = { id: string; name: string; type: "quantity" | "toggle"; enabled: boolean };
export type CatalogCategory = { id: string; name: string; icon: string; enabled: boolean; items: ProductItem[] };
export type Catalog = { version: number; updatedAt: string; categories: CatalogCategory[] };

export async function fetchCatalog(): Promise<Catalog | null> {
  try {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      if (j?.categories) return j as Catalog;
      if (Array.isArray(j)) return null;
      return j as Catalog;
    }
  } catch {}
  // fallback: fetch static from old database/products.json if still present (during migration)
  try {
    const r = await fetch("/database/products.json");
    if (r.ok) return (await r.json()) as Catalog;
  } catch {}
  return null;
}
