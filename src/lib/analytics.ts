import { calculateCashDesk, calculateEffectiveRevenue, calculateGlovoNet } from "./revenue";

function calculateHours(s: string) {
  if (!s) return 0;
  const n = s.replace("–", "-");
  if (!n.includes("-")) return 0;
  const [a, b] = n.split("-").map((x) => x.trim());
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  let h = h2 - h1; let m = m2 - m1;
  if (m < 0) { h--; m += 60; }
  if (h < 0) h += 24;
  return h + m / 60;
}

export type RawReport = {
  location: string;
  date: string;
  revenue: number;
  cardRevenue: number;
  glovoRevenue: number;
  employees: Record<string, string>;
  products: Record<string, number>;
};

export type DayEntry = {
  dateStr: string;
  dateObj: Date;
  timestamp: number;
  dayOfWeek: string;
  total: number;
  cardTotal: number;
  cashTotal: number;
  glovoTotal: number;
  glovoNetTotal: number;
  cashDeskTotal: number;
  oswiecim: number;
  osiek: number;
  wilamowice: number;
  oswiecimCard: number;
  osiekCard: number;
  wilamowiceCard: number;
  oswiecimGlovo: number;
  osiekGlovo: number;
  wilamowiceGlovo: number;
  oswiecimGlovoNet: number;
  osiekGlovoNet: number;
  wilamowiceGlovoNet: number;
  oswiecimCash: number;
  osiekCash: number;
  wilamowiceCash: number;
  locations: Record<string, { name: string; key: string; total: number; card: number; cash: number; glovo: number; glovoNet: number; cashDesk: number; reports: RawReport[] }>;
  rawReports: RawReport[];
  [k: string]: unknown;
};

function parseReportDate(s: string) {
  const m = String(s || "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  if (!d || !mo || !y) return null;
  return new Date(y, mo - 1, d);
}
function getLocationKey(loc: string) {
  if (loc === "Oświęcim") return "oswiecim";
  if (loc === "Osiek") return "osiek";
  if (loc === "Wilamowice") return "wilamowice";
  return "";
}

export function processReports(reports: RawReport[]): DayEntry[] {
  const map = new Map<string, DayEntry>();
  reports
    .filter((r) => r?.date && r?.location)
    .forEach((r) => {
      if (!map.has(r.date)) {
        const dateObj = parseReportDate(r.date);
        if (!dateObj) return;
        map.set(r.date, {
          dateStr: r.date,
          dateObj,
          timestamp: dateObj.getTime(),
          dayOfWeek: dateObj.toLocaleDateString("pl-PL", { weekday: "long" }),
          total: 0, cardTotal: 0, cashTotal: 0, glovoTotal: 0, glovoNetTotal: 0, cashDeskTotal: 0,
          oswiecim: 0, osiek: 0, wilamowice: 0,
          oswiecimCard: 0, osiekCard: 0, wilamowiceCard: 0,
          oswiecimGlovo: 0, osiekGlovo: 0, wilamowiceGlovo: 0,
          oswiecimGlovoNet: 0, osiekGlovoNet: 0, wilamowiceGlovoNet: 0,
          oswiecimCash: 0, osiekCash: 0, wilamowiceCash: 0,
          locations: {},
          rawReports: [],
        } as DayEntry);
      }
      const entry = map.get(r.date)!;
      const revGross = r.revenue ?? 0;
      const card = r.cardRevenue || 0;
      const glovo = r.glovoRevenue || 0;
      const glovoNet = calculateGlovoNet(glovo);
      const rev = calculateEffectiveRevenue(revGross, glovo);
      const cashDesk = Math.max(0, calculateCashDesk(revGross, card, glovo));
      const cash = cashDesk;
      const lk = getLocationKey(r.location);
      if (!entry.locations[r.location]) {
        entry.locations[r.location] = { name: r.location, key: lk, total: 0, card: 0, cash: 0, glovo: 0, glovoNet: 0, cashDesk: 0, reports: [] };
      }
      const loc = entry.locations[r.location];
      loc.total += rev; loc.card += card; loc.cash += cash; loc.glovo += glovo; loc.glovoNet += glovoNet; loc.cashDesk += cashDesk; loc.reports.push(r);
      if (lk) {
        (entry as unknown as Record<string, number>)[lk] += rev;
        (entry as unknown as Record<string, number>)[`${lk}Card`] += card;
        (entry as unknown as Record<string, number>)[`${lk}Cash`] += cash;
        (entry as unknown as Record<string, number>)[`${lk}Glovo`] += glovo;
        (entry as unknown as Record<string, number>)[`${lk}GlovoNet`] += glovoNet;
      }
      entry.total += rev; entry.cardTotal += card; entry.cashTotal += cash; entry.glovoTotal += glovo; entry.glovoNetTotal += glovoNet; entry.cashDeskTotal += cashDesk;
      entry.rawReports.push(r);
    });
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export function calculateEmployeeStats(data: DayEntry[]) {
  const m = new Map<string, { name: string; hours: number; locBreakdown: Record<string, number> }>();
  data.forEach((day) => {
    day.rawReports.forEach((r) => {
      if (!r.employees) return;
      Object.entries(r.employees).forEach(([name, time]) => {
        const h = calculateHours(time);
        if (!m.has(name)) m.set(name, { name, hours: 0, locBreakdown: {} });
        const s = m.get(name)!; s.hours += h; s.locBreakdown[r.location] = (s.locBreakdown[r.location] || 0) + h;
      });
    });
  });
  return Array.from(m.values()).sort((a, b) => b.hours - a.hours);
}

export function filterByMonth(data: DayEntry[], year: string | number, month: string | number) {
  return data.filter((d) => d.dateObj.getFullYear() == Number(year) && d.dateObj.getMonth() + 1 == Number(month));
}
