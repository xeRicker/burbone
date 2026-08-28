type Catalog = { categories: { name: string; items: { name: string; type: string }[] }[] } | null;
export function buildReportText(
  report: { location: string; date: string; employees: Record<string, string>; products: Record<string, number | string> },
  catalog: Catalog
) {
  if (!report) return "";
  const lines = [`📋 ${report.location} ${report.date}`];
  Object.entries(report.employees || {}).forEach(([name, time]) => {
    if (name && time) lines.push(`• ${name}: ${time}`);
  });
  const productsText = buildProductsText(report.products || {}, catalog);
  if (productsText) lines.push(productsText);
  return lines.join("\n").trim();
}
function hasProductValue(v: unknown) {
  if (v === true) return true;
  if (typeof v === "string") return v.trim() !== "" && Number(v) > 0;
  return Number(v) > 0;
}
export function buildProductsText(products: Record<string, unknown>, catalog: Catalog) {
  const categories = Array.isArray(catalog?.categories) ? catalog!.categories : [];
  const used = new Set<string>();
  const sections: string[] = [];
  categories.forEach((cat) => {
    const lines: string[] = [];
    (cat.items || []).forEach((p) => {
      const qty = products[p.name];
      used.add(p.name);
      if (p.name.includes("Bułki") && Number(qty) === 0) {
        lines.push("  • Bułki: ❌");
        return;
      }
      if (!hasProductValue(qty)) return;
      const isToggle = p.type === "toggle" || p.type === "s";
      lines.push(`  • ${p.name}${isToggle ? "" : `: ${qty}`}`);
    });
    if (lines.length) sections.push(`${cat.name}\n${lines.join("\n")}`);
  });
  const uncategorized = Object.entries(products)
    .filter(([n, q]) => !used.has(n) && hasProductValue(q))
    .map(([n, q]) => `  • ${n}: ${q}`);
  if (uncategorized.length) sections.push(`Inne\n${uncategorized.join("\n")}`);
  return sections.length ? `\n${sections.join("\n")}` : "";
}
