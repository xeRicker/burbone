"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { processReports, calculateEmployeeStats, filterByMonth, type DayEntry, type RawReport } from "@/lib/analytics";
import { buildReportText } from "@/lib/reportFormatter";
import { fetchCatalog, type Catalog } from "@/lib/catalog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const PASSWORD = "xdxdxd123";
const AUTH_KEY = "burbone-admin-access";
const AUTH_MS = 24 * 60 * 60 * 1000;

function formatMoney(n: number) { return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n); }
function formatPercent(v: number, total: number) { if (!total) return "0.0%"; return `${((v/total)*100).toFixed(1)}%`; }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [allReports, setAllReports] = useState<RawReport[]>([]);
  const [processed, setProcessed] = useState<DayEntry[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [weekKey, setWeekKey] = useState("all");
  const [viewMode, setViewMode] = useState<"total"|"cards"|"glovo">("total");
  const [chartType, setChartType] = useState<"bar"|"line">("bar");
  const [revenueSort, setRevenueSort] = useState<{key:string; dir:"asc"|"desc"}>({key:"date", dir:"desc"});
  const [adminTab, setAdminTab] = useState<"revenue"|"payroll"|"monthly"|"products"|"lists">("revenue");
  const [isFull, setIsFull] = useState(false);
  const [payrollEmp, setPayrollEmp] = useState("");
  const [payrollRate, setPayrollRate] = useState("30");
  const [payrollFrom, setPayrollFrom] = useState("");
  const [payrollTo, setPayrollTo] = useState("");
  const [listFilter, setListFilter] = useState("all");
  const [listSearch, setListSearch] = useState("");
  const [preview, setPreview] = useState<RawReport | null>(null);

  // auth check
  useEffect(() => {
    const isLocal = typeof window !== "undefined" && (location.hostname === "localhost" || location.hostname === "127.0.0.1");
    if (isLocal) { setAuthed(true); return; }
    try { const a = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); if (a?.expiresAt > Date.now()) setAuthed(true); } catch {}
  }, []);
  const tryAuth = () => {
    if (pass === PASSWORD) { localStorage.setItem(AUTH_KEY, JSON.stringify({ expiresAt: Date.now()+AUTH_MS })); setAuthed(true); setPassErr(""); }
    else setPassErr("Błędne hasło");
  };

  useEffect(() => { fetchCatalog().then(setCatalog); }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/reports?recentMonths=1");
        const j = await r.json();
        const data: RawReport[] = Array.isArray(j) ? j : [];
        // if empty (no blob token), create mock like apiService mock for demo so admin not empty
        let reports = data;
        if (!reports.length) {
          // fallback: try fetch without filter (all) or keep empty
          const r2 = await fetch("/api/reports");
          const j2 = await r2.json();
          reports = Array.isArray(j2) ? j2 : [];
        }
        setAllReports(reports);
        const proc = processReports(reports);
        setProcessed(proc);
        if (proc.length) {
          const m = `${proc[0].dateObj.getFullYear()}-${String(proc[0].dateObj.getMonth()+1).padStart(2,"0")}`;
          setMonth(m);
          const [y,mo] = m.split("-");
          const last = new Date(Number(y), Number(mo), 0).getDate();
          setPayrollFrom(`${y}-${mo}-01`); setPayrollTo(`${y}-${mo}-${String(last).padStart(2,"0")}`);
        }
      } catch { setAllReports([]); setProcessed([]); }
      setLoading(false);
    })();
  }, [authed]);

  const monthOptions = useMemo(() => {
    const s = new Set(processed.map((d)=> `${d.dateObj.getFullYear()}-${String(d.dateObj.getMonth()+1).padStart(2,"0")}`));
    return Array.from(s).sort().reverse();
  }, [processed]);

  const currentData = useMemo(() => {
    if (!month) return [];
    const [y,m] = month.split("-");
    return filterByMonth(processed, y, m);
  }, [processed, month]);

  const weeks = useMemo(() => {
    const sorted = [...currentData].sort((a,b)=>a.timestamp-b.timestamp);
    const buckets: DayEntry[][] = []; let b: DayEntry[] = [];
    sorted.forEach((d)=>{ b.push(d); if (d.dayOfWeek==="niedziela") { buckets.push(b); b=[]; }});
    if (b.length) buckets.push(b);
    return buckets;
  }, [currentData]);

  const activeData = useMemo(() => {
    if (weekKey==="all") return currentData;
    const idx = Number(weekKey); return weeks[idx] ?? currentData;
  }, [currentData, weeks, weekKey]);

  const loadFull = async () => {
    if (isFull) return;
    setLoading(true);
    try { const r = await fetch("/api/reports"); const j = await r.json(); const data:RawReport[] = Array.isArray(j)?j:[]; setAllReports(data); setProcessed(processReports(data)); setIsFull(true);} catch {}
    setLoading(false);
  };

  const getMetric = (e: unknown, mode: string) => {
    const d = e as Record<string,number>;
    if (mode==="cards") return d.card ?? d.cardTotal ?? 0;
    if (mode==="glovo") return d.glovoNet ?? d.glovoNetTotal ?? 0;
    return d.total ?? 0;
  };

  const chartData = useMemo(() => {
    const sorted = [...activeData].sort((a,b)=>a.timestamp-b.timestamp);
    return sorted.map((d)=> {
      const row: Record<string,string|number> = { date: d.dateStr.slice(0,5), day: d.dayOfWeek.slice(0,3), total: Math.round(d.total), cards: Math.round(d.cardTotal), glovo: Math.round(d.glovoNetTotal), cash: Math.round(d.cashDeskTotal) };
      Object.entries(d.locations).forEach(([name, loc])=> { row[name]=Math.round(getMetric(loc, viewMode)); });
      return row;
    });
  }, [activeData, viewMode]);

  const locations = useMemo(()=> Array.from(new Set(activeData.flatMap((d)=>Object.keys(d.locations)))), [activeData]);
  const summary = useMemo(()=> {
    const total = activeData.reduce((s,d)=>s+d.total,0);
    const cards = activeData.reduce((s,d)=>s+d.cardTotal,0);
    const glovo = activeData.reduce((s,d)=>s+d.glovoNetTotal,0);
    const cash = activeData.reduce((s,d)=>s+d.cashDeskTotal,0);
    return { total, cards, glovo, cash, avg: activeData.length? total/activeData.length:0, count: activeData.length };
  }, [activeData]);
  const empStats = useMemo(()=> calculateEmployeeStats(activeData), [activeData]);

  const revenueRows = useMemo(()=> {
    const arr=[...activeData];
    const mult = revenueSort.dir==="asc"?1:-1;
    arr.sort((a,b)=>{
      if (revenueSort.key==="date") return (a.timestamp-b.timestamp)*mult;
      if (revenueSort.key==="glovoDisplay") return (a.glovoNetTotal - b.glovoNetTotal)*mult;
      const k = revenueSort.key as keyof DayEntry;
      return (((a as unknown as Record<string,number>)[k as string]||0) - ((b as unknown as Record<string,number>)[k as string]||0))*mult;
    });
    return arr;
  }, [activeData, revenueSort]);

  const payrollCalc = useMemo(()=>{
    const rate = parseFloat(payrollRate)||0; const from = payrollFrom? new Date(payrollFrom):null; const to = payrollTo? new Date(payrollTo):null; if (to) to.setHours(23,59,59,999);
    if (!payrollEmp || !from || !to) return null;
    let total=0; const loc:Record<string,number>={}; const breakdown:{date:string; location:string; shift:string; hours:number; amount:number; d:Date}[]=[];
    (allReports as RawReport[]).forEach((r)=>{ const [d,m,y]=r.date.split(".").map(Number); const rd=new Date(y,m-1,d); const shift=r.employees?.[payrollEmp]; if(!shift||rd<from||rd>to) return; const h = (()=>{const n=shift.replace("–","-"); const [a,b]=n.split("-").map((x)=>x.trim()); const [h1,mi1]=a.split(":").map(Number); const [h2,mi2]=b.split(":").map(Number); let h=h2-h1; let mi=mi2-mi1; if(mi<0){h--;mi+=60;} if(h<0)h+=24; return h+mi/60;})(); total+=h; loc[r.location]=(loc[r.location]||0)+h; breakdown.push({date:r.date, location:r.location, shift, hours:h, amount:h*rate, d:rd});});
    breakdown.sort((a,b)=>a.d.getTime()-b.d.getTime());
    return { total, amount: total*rate, breakdown, loc, count: breakdown.length };
  }, [allReports, payrollEmp, payrollRate, payrollFrom, payrollTo]);

  const filteredLists = useMemo(()=>{
    let a = [...allReports].sort((x,y)=> y.date.split(".").reverse().join("-").localeCompare(x.date.split(".").reverse().join("-")));
    if (listFilter!=="all") a=a.filter((r)=>r.location===listFilter);
    if (listSearch) { const s=listSearch.toLowerCase(); a=a.filter((r)=> r.date.toLowerCase().includes(s) || r.location.toLowerCase().includes(s)); }
    return a;
  }, [allReports, listFilter, listSearch]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm bg-card border-border rounded-sm">
          <CardHeader><CardTitle>Podaj hasło administratora</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} placeholder="hasło" className="rounded-sm" onKeyDown={(e)=>e.key==="Enter" && tryAuth()} />
            {passErr && <p className="text-sm text-[var(--app-danger)]">{passErr}</p>}
            <Button onClick={tryAuth} className="w-full bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-sm">WEJDŹ</Button>
            <Button variant="outline" className="w-full rounded-sm" onClick={()=>location.href="/"}>WRÓĆ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3"><img src="/favicon.png" alt="Burbone" className="h-8 w-8 rounded-sm" /><span className="text-xl font-bold tracking-tight">BURBONE ADMIN</span></div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-sm border-primary/20" onClick={loadFull} disabled={isFull || loading}>{isFull?"Pobrano wszystko":"ZAŁADUJ DANE"}</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-sm" onClick={()=>location.href="/"}>WRÓĆ</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {(["revenue","payroll","monthly","products","lists"] as const).map((t)=> (
            <Button key={t} variant={adminTab===t?"default":"outline"} className={`rounded-sm ${adminTab===t?"bg-primary text-primary-foreground":""}`} onClick={()=>setAdminTab(t)}>
              {t==="revenue"?"Utargi":t==="payroll"?"Wynagrodzenia":t==="monthly"?"Raport miesiąca":t==="products"?"Produkty":"Listy"}
            </Button>
          ))}
        </div>

        {adminTab==="revenue" && (
          <>
            <Card className="bg-card border-border rounded-sm">
              <CardContent className="flex flex-wrap gap-4 items-end p-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">MIESIĄC</label>
                  <select value={month} onChange={(e)=>{setMonth(e.target.value); setWeekKey("all"); const [y,m]=e.target.value.split("-"); const last=new Date(Number(y),Number(m),0).getDate(); setPayrollFrom(`${y}-${m}-01`); setPayrollTo(`${y}-${m}-${String(last).padStart(2,"0")}`);}} className="h-9 rounded-sm border bg-background px-3 text-sm min-w-[180px]">
                    {monthOptions.map((m)=>{ const [y,mo]=m.split("-"); const label=new Date(Number(y),Number(mo)-1,1).toLocaleString("pl-PL",{month:"long"}); return <option key={m} value={m}>{m} ({label})</option>; })}
                  </select>
                </div>
                <div className="h-9 w-px bg-border hidden md:block" />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">TYDZIEŃ</label>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant={weekKey==="all"?"default":"outline"} className={`rounded-sm h-7 text-xs ${weekKey==="all"?"bg-primary":""}`} onClick={()=>setWeekKey("all")}>CAŁY MIESIĄC</Button>
                    {weeks.map((w,i)=>{ const s=w[0].dateStr.slice(0,5); const e=w[w.length-1].dateStr.slice(0,5); return <Button key={i} size="sm" variant={weekKey===String(i)?"default":"outline"} className={`rounded-sm h-7 text-xs ${weekKey===String(i)?"bg-primary":""}`} onClick={()=>setWeekKey(String(i))}>TYDZIEŃ {i+1} ({s}-{e})</Button>; })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? <p className="text-sm text-muted-foreground">Ładowanie...</p> : !activeData.length ? <p className="text-sm text-muted-foreground">Brak danych dla filtra.</p> : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-card border-border rounded-sm border-primary/20"><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Utarg</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatMoney(summary.total)}</div><div className="text-xs text-muted-foreground">{summary.count} dni / śr. {formatMoney(summary.avg)}</div></CardContent></Card>
                  <Card className="bg-card border-border rounded-sm"><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Karty</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{formatMoney(summary.cards)}</div><div className="text-xs text-muted-foreground">{formatPercent(summary.cards, summary.total)}</div></CardContent></Card>
                  <Card className="bg-card border-border rounded-sm border-[var(--glovo-color)]/20"><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Glovo (po prowizji)</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{formatMoney(summary.glovo)}</div></CardContent></Card>
                  <Card className="bg-card border-border rounded-sm"><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Gotówka</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{formatMoney(summary.cash)}</div><div className="text-xs text-muted-foreground">{formatPercent(summary.cash, summary.total)}</div></CardContent></Card>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="flex gap-1 rounded-sm border bg-card p-1">
                    {(["total","cards","glovo"] as const).map((v)=> <Button key={v} size="sm" variant={viewMode===v?"default":"ghost"} className={`rounded-sm h-7 text-xs ${viewMode===v?"bg-primary text-primary-foreground":""}`} onClick={()=>setViewMode(v)}>{v==="total"?"UTARG CAŁKOWITY":v==="cards"?"KARTY":"GLOVO"}</Button>)}
                  </div>
                  <div className="flex gap-1 rounded-sm border bg-card p-1">
                    <Button size="sm" variant={chartType==="bar"?"default":"ghost"} className={`rounded-sm h-7 text-xs ${chartType==="bar"?"bg-primary text-primary-foreground":""}`} onClick={()=>setChartType("bar")}>Słupkowy</Button>
                    <Button size="sm" variant={chartType==="line"?"default":"ghost"} className={`rounded-sm h-7 text-xs ${chartType==="line"?"bg-primary text-primary-foreground":""}`} onClick={()=>setChartType("line")}>Liniowy</Button>
                  </div>
                </div>

                <Card className="bg-card border-border rounded-sm">
                  <CardHeader><CardTitle className="text-sm">Wizualizacja utargu — {viewMode}</CardTitle></CardHeader>
                  <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType==="bar" ? (
                        <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="date" tick={{fontSize:11}} /><YAxis tickFormatter={(v)=>`${Math.round(v)} zł`} /><Tooltip /><Legend />{locations.map((loc,i)=> <Bar key={loc} dataKey={loc} fill={["#D4521A","#7DCE82","#7AB8FF","#F6C85F","#C58CFF"][i%5]} /> )}</BarChart>
                      ) : (
                        <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />{locations.map((loc,i)=> <Line key={loc} type="monotone" dataKey={loc} stroke={["#D4521A","#7DCE82","#7AB8FF"][i%3]} strokeWidth={2} dot={false} /> )}</LineChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-sm">
                  <CardHeader><CardTitle className="text-sm">Mapa Cieplna</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {["PON","WTO","ŚRO","CZW","PIA","SOB","NIE"].map((d)=><div key={d} className="text-center text-muted-foreground py-1">{d}</div>)}
                      {(() => {
                        const [y,m] = month.split("-").map(Number);
                        const days = new Date(y,m,0).getDate();
                        const start = new Date(y,m-1,1).getDay() || 7;
                        const peak = Math.max(...activeData.map((d)=> getMetric(d, viewMode)), 1);
                        const map = new Map(activeData.map((d)=>[d.dateStr, d]));
                        const cells: React.ReactNode[] = [];
                        for (let i=1;i<start;i++) cells.push(<div key={`e${i}`} className="h-16 rounded-sm bg-muted/30" />);
                        for (let d=1; d<=days; d++) {
                          const ds = `${String(d).padStart(2,"0")}.${String(m).padStart(2,"0")}.${y}`;
                          const entry = map.get(ds);
                          const val = entry ? getMetric(entry, viewMode) : 0;
                          const intens = entry ? Math.min(val/peak,1) : 0;
                          const bg = !entry ? "bg-muted/20" : intens>=0.78 ? "bg-primary text-primary-foreground" : intens>=0.45 ? "bg-[var(--primary-soft)] border border-primary/20" : "bg-card border";
                          cells.push(<div key={d} className={`h-16 rounded-sm border p-1 flex flex-col justify-between ${bg}`}><span className="text-[11px]">{d}</span>{entry && <span className="text-[11px] font-bold">{Math.round(val)} zł</span>}</div>);
                        }
                        return cells;
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-sm">
                  <CardHeader><CardTitle className="text-sm">Raport Dzienny</CardTitle></CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-muted-foreground text-xs"><th className="text-left p-2 cursor-pointer" onClick={()=>setRevenueSort({key:"date", dir: revenueSort.key==="date"&&revenueSort.dir==="desc"?"asc":"desc"})}>Dzień</th><th className="text-left p-2">Punkty</th><th className="text-right p-2 cursor-pointer" onClick={()=>setRevenueSort({key:"cardTotal", dir: revenueSort.dir==="asc"?"desc":"asc"})}>Karty</th><th className="text-right p-2">Glovo</th><th className="text-right p-2">Gotówka</th><th className="text-right p-2">Utarg</th></tr></thead>
                      <tbody>{revenueRows.map((d)=> (
                        <tr key={d.dateStr} className="border-b last:border-0">
                          <td className="p-2"><div className="font-medium capitalize">{d.dayOfWeek}</div><div className="text-xs text-muted-foreground">{d.dateStr}</div></td>
                          <td className="p-2"><div className="flex flex-col gap-1">{Object.values(d.locations).sort((a,b)=>b.total-a.total).map((l)=><Badge key={l.name} variant="outline" className="rounded-sm justify-between">{l.name} <span className="ml-2 font-bold">{formatMoney(l.total)}</span></Badge>)}</div></td>
                          <td className="p-2 text-right">{formatMoney(d.cardTotal)}</td>
                          <td className="p-2 text-right">{formatMoney(d.glovoNetTotal)}</td>
                          <td className="p-2 text-right">{formatMoney(d.cashDeskTotal)}</td>
                          <td className="p-2 text-right font-bold">{formatMoney(d.total)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {adminTab==="payroll" && (
          <Card className="bg-card border-border rounded-sm">
            <CardHeader><CardTitle>Kalkulator Wypłaty</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1"><label className="text-xs text-muted-foreground">Pracownik</label><select value={payrollEmp} onChange={(e)=>setPayrollEmp(e.target.value)} className="h-9 w-full rounded-sm border bg-background px-3 text-sm"><option value="">Wybierz</option>{Array.from(new Set(allReports.flatMap((r)=>Object.keys(r.employees||{})))).sort().map((n)=><option key={n} value={n}>{n}</option>)}</select></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">Stawka</label><Input value={payrollRate} onChange={(e)=>setPayrollRate(e.target.value)} className="rounded-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">Od</label><Input type="date" value={payrollFrom} onChange={(e)=>setPayrollFrom(e.target.value)} className="rounded-sm" /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">Do</label><Input type="date" value={payrollTo} onChange={(e)=>setPayrollTo(e.target.value)} className="rounded-sm" /></div>
              </div>
              {!payrollCalc ? <p className="text-sm text-muted-foreground">Wybierz pracownika i zakres.</p> : (
                <>
                  <div className="grid grid-cols-2 gap-4 rounded-sm bg-[var(--surface-raised)] p-4 border"><div><div className="text-xs text-muted-foreground">GODZINY</div><div className="text-2xl font-bold">{payrollCalc.total.toFixed(1)} h</div></div><div><div className="text-xs text-muted-foreground">WYPŁATA</div><div className="text-2xl font-bold text-primary">{formatMoney(payrollCalc.amount)}</div></div></div>
                  <div className="overflow-x-auto rounded-sm border"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left p-2">Data</th><th className="text-left p-2">Lokal</th><th className="text-left p-2">Zmiana</th><th className="text-right p-2">Godz</th><th className="text-right p-2">Kwota</th></tr></thead><tbody>{payrollCalc.breakdown.map((b,i)=><tr key={i} className="border-t"><td className="p-2">{b.date}</td><td className="p-2">{b.location}</td><td className="p-2">{b.shift}</td><td className="p-2 text-right">{b.hours.toFixed(1)} h</td><td className="p-2 text-right">{formatMoney(b.amount)}</td></tr>)}</tbody></table></div>
                  <Card className="bg-card border-border rounded-sm"><CardHeader><CardTitle className="text-sm">Raport Godzin</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Pracownik</th><th className="text-right p-2">Godziny</th><th className="text-right p-2">% Etatu</th><th className="text-left p-2">Lokalizacje</th></tr></thead><tbody>{empStats.map((e)=><tr key={e.name} className="border-b"><td className="p-2 font-medium">{e.name}</td><td className="p-2 text-right">{e.hours.toFixed(1)} h</td><td className="p-2 text-right">{((e.hours/160)*100).toFixed(1)}%</td><td className="p-2"><div className="flex flex-wrap gap-1">{Object.entries(e.locBreakdown).map(([loc,h])=><Badge key={loc} variant="outline" className="rounded-sm">{loc} {Math.round(h/e.hours*100)}%</Badge>)}</div></td></tr>)}</tbody></table></CardContent></Card>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {adminTab==="lists" && (
          <Card className="bg-card border-border rounded-sm">
            <CardHeader><CardTitle>Wygenerowane Listy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <select value={listFilter} onChange={(e)=>setListFilter(e.target.value)} className="h-9 rounded-sm border bg-background px-3 text-sm"><option value="all">Wszystkie</option><option value="Oświęcim">Oświęcim</option><option value="Osiek">Osiek</option><option value="Wilamowice">Wilamowice</option></select>
                <Input placeholder="Szukaj daty lub punktu" value={listSearch} onChange={(e)=>setListSearch(e.target.value)} className="rounded-sm max-w-xs" />
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredLists.map((r)=> (
                  <Card key={`${r.location}-${r.date}`} className="bg-[var(--surface-raised)] border-border rounded-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex justify-between"><span>{r.location} {r.date}</span><span className="text-xs text-muted-foreground">{formatMoney(r.revenue)}</span></CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <pre className="text-xs whitespace-pre-wrap bg-card p-2 rounded-sm border max-h-[160px] overflow-auto">{buildReportText(r, catalog)}</pre>
                      <div className="flex gap-2"><Button size="sm" className="flex-1 bg-primary text-primary-foreground rounded-sm" onClick={()=>{ setPreview(r); }}>Podgląd</Button><Button size="sm" variant="outline" className="flex-1 rounded-sm" onClick={async()=>{ const t=buildReportText(r,catalog); try{await navigator.clipboard.writeText(t);}catch{const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();} }}>Kopiuj</Button></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!filteredLists.length && <p className="text-sm text-muted-foreground">Brak list.</p>}
            </CardContent>
          </Card>
        )}

        {adminTab==="products" && (
          <ProductsEditor catalog={catalog} onSave={async (c)=>{ await fetch("/api/products", {method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(c)}); setCatalog(c); }} />
        )}

        {adminTab==="monthly" && (
          <Card className="bg-card border-border rounded-sm"><CardHeader><CardTitle>Raport miesiąca</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Porównanie ostatnich 2 zamkniętych miesięcy — uproszczony widok. Pełny raport z wykresami jest dostępny po ZAŁADUJ DANE.</CardContent></Card>
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(o)=>!o && setPreview(null)}>
        <DialogContent className="bg-[var(--surface-overlay)] max-w-lg rounded-sm">
          <DialogHeader><DialogTitle>{preview?.location} {preview?.date}</DialogTitle><DialogDescription>Podgląd raportu</DialogDescription></DialogHeader>
          <pre className="max-h-[60vh] overflow-auto bg-[var(--surface-raised)] p-3 rounded-sm text-xs whitespace-pre-wrap">{preview && buildReportText(preview, catalog)}</pre>
          <Button onClick={async()=>{ if(!preview) return; const t=buildReportText(preview,catalog); try{await navigator.clipboard.writeText(t);}catch{}; setPreview(null); }} className="w-full bg-primary rounded-sm">Kopiuj</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsEditor({ catalog, onSave }: { catalog: Catalog | null; onSave: (c: Catalog)=>Promise<void> }) {
  const [local, setLocal] = useState<Catalog | null>(catalog);
  const [saving, setSaving] = useState(false);
  useEffect(()=> setLocal(catalog), [catalog]);
  if (!local) return <Card className="bg-card border-border rounded-sm"><CardContent className="p-4 text-sm text-muted-foreground">Ładowanie katalogu...</CardContent></Card>;
  const toggleCat = (id:string)=> setLocal({...local, categories: local.categories.map((c)=> c.id===id? {...c, enabled: !c.enabled}:c)});
  const toggleProd = (catId:string, prodId:string)=> setLocal({...local, categories: local.categories.map((c)=> c.id===catId? {...c, items: c.items.map((p)=> p.id===prodId? {...p, enabled: !p.enabled}:p)}:c)});
  const save = async ()=>{ setSaving(true); await onSave({...local, updatedAt: new Date().toISOString()}); setSaving(false); };
  return (
    <Card className="bg-card border-border rounded-sm">
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Produkty</CardTitle><Button onClick={save} disabled={saving} className="bg-primary rounded-sm">{saving?"Zapisywanie...":"Zapisz"} </Button></CardHeader>
      <CardContent className="space-y-4">
        {local.categories.map((cat)=>(
          <div key={cat.id} className="border rounded-sm p-3 space-y-2 bg-[var(--surface-raised)]">
            <div className="flex items-center justify-between"><span className="font-medium">{cat.name} {cat.icon}</span><label className="text-xs flex items-center gap-1"><input type="checkbox" checked={cat.enabled} onChange={()=>toggleCat(cat.id)} /> aktywna</label></div>
            <div className="grid gap-1 md:grid-cols-2">{cat.items.map((p)=>(
              <label key={p.id} className="flex items-center justify-between rounded-sm border bg-card p-2 text-sm"><span>{p.name} <span className="text-xs text-muted-foreground">({p.type})</span></span><input type="checkbox" checked={p.enabled} onChange={()=>toggleProd(cat.id, p.id)} /></label>
            ))}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
