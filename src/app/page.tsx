"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EMPLOYEES, EMPLOYEE_COLORS, TIME_PRESETS } from "@/lib/data";
import { calculateCashDesk } from "@/lib/revenue";
import { buildReportText } from "@/lib/reportFormatter";
import { fetchCatalog, type Catalog } from "@/lib/catalog";
import { BurgerConfigurator } from "@/components/burger-configurator";

type EmpState = Record<string, { f: string; t: string }>;
type TempEmp = { id: string; name: string; color: string; f: string; t: string };
type ProdState = Record<string, number>;

function getTodayKey() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function calculateHours(s: string) {
  if (!s) return 0;
  const n = s.replace("–", "-");
  if (!n.includes("-")) return 0;
  const [a, b] = n.split("-").map((x) => x.trim());
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  let h = h2 - h1;
  let m = m2 - m1;
  if (m < 0) { h--; m += 60; }
  if (h < 0) h += 24;
  return h + m / 60;
}
function formatMoney(n: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);
}

export default function Home() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [revenue, setRevenue] = useState("");
  const [cardRevenue, setCardRevenue] = useState("");
  const [glovoRevenue, setGlovoRevenue] = useState("");
  const [employees, setEmployees] = useState<EmpState>({});
  const [temps, setTemps] = useState<TempEmp[]>([]);
  const [products, setProducts] = useState<ProdState>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("generator");
  const [showLocation, setShowLocation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [payrollReports, setPayrollReports] = useState<unknown[]>([]);
  const [payrollReady, setPayrollReady] = useState(false);
  const [payrollEmp, setPayrollEmp] = useState("");
  const [payrollRate, setPayrollRate] = useState("30");
  const [payrollFrom, setPayrollFrom] = useState("");
  const [payrollTo, setPayrollTo] = useState("");

  useEffect(() => {
    fetchCatalog().then(setCatalog);
    const raw = localStorage.getItem("burbone_state");
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.revenue) setRevenue(s.revenue);
        if (s.cardRevenue) setCardRevenue(s.cardRevenue);
        if (s.glovoRevenue) setGlovoRevenue(s.glovoRevenue);
        if (s.employees) setEmployees(s.employees);
        if (s.products) {
          const p: ProdState = {}; const t: Record<string, boolean> = {};
          Object.entries(s.products as Record<string, unknown>).forEach(([k, v]) => {
            if (v === 1 || v === true) t[k] = true;
            else if (typeof v === "number" && v > 0) p[k] = v;
            else if (typeof v === "string" && Number(v) > 0) p[k] = Number(v);
          });
          setProducts(p); setToggles(t);
        }
      } catch {}
    }
    // payroll default month
    const now = new Date();
    const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, "0");
    const last = new Date(y, Number(m), 0).getDate();
    setPayrollFrom(`${y}-${m}-01`);
    setPayrollTo(`${y}-${m}-${String(last).padStart(2, "0")}`);
  }, []);

  const hasData = revenue || cardRevenue || glovoRevenue || Object.keys(employees).length || Object.keys(products).length || Object.keys(toggles).length || temps.some(t=>t.f&&t.t);

  useEffect(() => {
    const state = {
      products: { ...Object.fromEntries(Object.entries(products).filter(([,v])=>v>0)), ...Object.fromEntries(Object.entries(toggles).filter(([,v])=>v).map(([k])=>[k,1])) },
      employees,
      revenue, cardRevenue, glovoRevenue
    };
    const has = Object.keys(state.products).length || Object.keys(state.employees).length || state.revenue || state.cardRevenue || state.glovoRevenue;
    if (has) localStorage.setItem("burbone_state", JSON.stringify(state));
    else localStorage.removeItem("burbone_state");
  }, [products, toggles, employees, revenue, cardRevenue, glovoRevenue]);

  useEffect(() => {
    if (activeTab !== "workers" || payrollReady) return;
    (async () => {
      try {
        const r = await fetch("/api/reports?recentMonths=2");
        const j = await r.json();
        setPayrollReports(Array.isArray(j) ? j : []);
        setPayrollReady(true);
      } catch { setPayrollReady(true); }
    })();
  }, [activeTab, payrollReady]);

  const addTemp = () => {
    const id = `temp_${Date.now()}`;
    setTemps((a) => [...a, { id, name: "Nowy", color: "var(--primary-soft)", f: "", t: "" }]);
  };

  const onGenerate = async (location: string) => {
    const rev = parseFloat(revenue) || 0;
    const card = parseFloat(cardRevenue) || 0;
    const glovo = parseFloat(glovoRevenue) || 0;
    const cash = calculateCashDesk(rev, card, glovo);
    if (rev === 0 && !confirm("Utarg wynosi 0. Kontynuować?")) return;
    if (cash < 0) { alert("Karty i Glovo nie mogą być większe niż utarg lokalu."); return; }
    const date = getTodayKey();
    const empEntries: Record<string,string> = {};
    Object.entries(employees).forEach(([id, v]) => {
      if (v.f && v.t) {
        const name = EMPLOYEES.find((n) => n.toLowerCase() === id) ?? id;
        empEntries[name] = `${v.f} – ${v.t}`;
      }
    });
    temps.forEach((t) => { if (t.name && t.f && t.t) empEntries[t.name] = `${t.f} – ${t.t}`; });
    const prodEntries: Record<string, number> = {};
    catalog?.categories.forEach((cat) => cat.items.forEach((p) => {
      if (p.name.includes("Bułki")) {
        const v = products[p.name] ?? (toggles[p.name] ? 1 : 0);
        prodEntries[p.name] = v ? Number(v) : 0;
      } else if (p.type === "toggle") {
        if (toggles[p.name]) prodEntries[p.name] = 1;
      } else {
        const v = products[p.name];
        if (v && Number(v) > 0) prodEntries[p.name] = Number(v);
      }
    }));
    const data = { location, date, revenue: rev, cardRevenue: card, glovoRevenue: glovo, employees: empEntries, products: prodEntries };
    const text = buildReportText(data, catalog);
    setReportText(text);
    try {
      const res = await fetch("/api/reports", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(await res.text());
      setReportError(null);
    } catch (e) { setReportError(String((e as Error).message || e)); }
    setShowLocation(false);
    setShowSuccess(true);
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(reportText); } catch { const ta=document.createElement("textarea"); ta.value=reportText; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
  };

  // payroll calc
  const payrollCalc = (() => {
    const rate = parseFloat(payrollRate) || 0;
    const from = payrollFrom ? new Date(payrollFrom) : null;
    const to = payrollTo ? new Date(payrollTo) : null;
    if (to) to.setHours(23,59,59,999);
    if (!payrollEmp || !from || !to) return null;
    let total = 0; const breakdown: {date:string; location:string; shift:string; hours:number; amount:number; d:Date}[] = []; const loc: Record<string,number> = {};
    (payrollReports as {date:string; location:string; employees:Record<string,string>}[]).forEach((r) => {
      const [d,m,y] = r.date.split(".").map(Number); const rd = new Date(y,m-1,d); const shift = r.employees?.[payrollEmp]; if (!shift || rd < from || rd > to) return;
      const h = calculateHours(shift); total+=h; loc[r.location]=(loc[r.location]||0)+h; breakdown.push({date:r.date, location:r.location, shift, hours:h, amount:h*rate, d:rd});
    });
    breakdown.sort((a,b)=>a.d.getTime()-b.d.getTime());
    return { total, amount: total*rate, breakdown, loc, count: breakdown.length };
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Burbone" className="h-8 w-8 rounded-sm" />
            <span className="text-xl font-bold tracking-tight">BURBONE</span>
            <Badge variant="secondary" className="bg-[var(--primary-soft)] text-primary border-primary/20">WARM DARK</Badge>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-sm" onClick={()=> location.href="/admin"}>ADMIN</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto max-w-[1280px] px-4 py-6">
        <TabsList className="bg-card border rounded-sm p-1">
          <TabsTrigger value="generator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">LISTA</TabsTrigger>
          <TabsTrigger value="burgers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">BURGERY</TabsTrigger>
          <TabsTrigger value="workers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">WYNAGRODZENIA</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6 mt-6">
          <Card className="bg-card border-border rounded-sm">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><span className="material-symbols-rounded text-primary">payments</span> UTARG</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                { label: "UTARG", value: revenue, setter: setRevenue, id: "revenue" },
                { label: "KARTY", value: cardRevenue, setter: setCardRevenue, id: "card" },
                { label: "GLOVO", value: glovoRevenue, setter: setGlovoRevenue, id: "glovo", glovo: true },
              ].map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{f.label}</label>
                  <div className={`flex items-center rounded-sm border bg-[var(--surface-raised)] px-3 py-2 ${f.glovo ? "border-[var(--glovo-color)]/30" : "border-border"} focus-within:border-[var(--primary-hover)]`}>
                    <span className="text-xs text-muted-foreground mr-2">PLN</span>
                    <Input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder="0.00" inputMode="decimal" className="border-0 bg-transparent p-0 h-auto shadow-none focus-visible:ring-0" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-sm">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><span className="material-symbols-rounded text-primary">groups</span> EKIPA</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {EMPLOYEES.map((name) => {
                const id = name.toLowerCase();
                const v = employees[id] || { f: "", t: "" };
                return (
                  <div key={id} className={`flex items-center justify-between rounded-sm border p-3 gap-2 ${v.f && v.t ? "bg-[var(--primary-soft)] border-primary/20" : "bg-[var(--surface-raised)] border-border"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: EMPLOYEE_COLORS[name] }}>{name[0]}</div>
                      <span className="text-sm font-medium truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select value="" onChange={(e) => { const [s,e2]=e.target.value.split("-"); setEmployees((p)=>({...p,[id]:{f:s,t:e2}})); e.target.value=""; }} className="h-8 rounded-sm border bg-card px-1 text-xs max-w-[110px]">
                        <option value=""></option>{TIME_PRESETS.map((p)=><option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <Input type="time" value={v.f} onChange={(e)=>setEmployees((p)=>({...p,[id]:{...v,f:e.target.value}}))} className="h-8 w-[95px] rounded-sm" />
                      <span className="text-muted-foreground">-</span>
                      <Input type="time" value={v.t} onChange={(e)=>setEmployees((p)=>({...p,[id]:{...v,t:e.target.value}}))} className="h-8 w-[95px] rounded-sm" />
                    </div>
                  </div>
                );
              })}
              {temps.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-sm border p-3 gap-2 bg-[var(--surface-raised)] border-border">
                  <Input value={t.name} onChange={(e)=>setTemps((a)=>a.map((x)=>x.id===t.id?{...x,name:e.target.value}:x))} className="h-8 w-[110px] rounded-sm" placeholder="Nowy" />
                  <div className="flex items-center gap-1">
                    <Input type="time" value={t.f} onChange={(e)=>setTemps((a)=>a.map((x)=>x.id===t.id?{...x,f:e.target.value}:x))} className="h-8 w-[95px] rounded-sm" />
                    <span>-</span>
                    <Input type="time" value={t.t} onChange={(e)=>setTemps((a)=>a.map((x)=>x.id===t.id?{...x,t:e.target.value}:x))} className="h-8 w-[95px] rounded-sm" />
                    <Button variant="ghost" size="sm" onClick={()=>setTemps((a)=>a.filter((x)=>x.id!==t.id))} className="h-8 w-8 p-0">×</Button>
                  </div>
                </div>
              ))}
              <button onClick={addTemp} className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground hover:bg-muted flex items-center justify-center gap-2">+ NOWY (jednorazowo)</button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {!catalog ? <p className="text-sm text-muted-foreground">Ładowanie katalogu...</p> : catalog.categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground"><span className="material-symbols-rounded text-base">{cat.icon}</span> {cat.name}</div>
                <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {cat.items.filter((i)=>i.enabled).map((p) => {
                    const isToggle = p.type === "toggle";
                    const active = isToggle ? !!toggles[p.name] : (products[p.name] ?? 0) > 0;
                    return (
                      <div key={p.id} onClick={()=>{ if(isToggle) setToggles((s)=>({...s,[p.name]:!s[p.name]}));}} className={`rounded-sm border p-3 flex items-center justify-between cursor-pointer ${active ? "bg-[var(--primary-soft)] border-primary/30" : "bg-card border-border"} ${isToggle ? "hover:bg-muted" : ""}`}>
                        <span className="text-sm truncate pr-2">{p.name}</span>
                        {isToggle ? <div className={`h-5 w-5 rounded-sm border flex items-center justify-center shrink-0 ${active ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"}`}>{active && "✓"}</div>
                        : <div className="flex items-center gap-1 shrink-0" onClick={(e)=>e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-sm" onClick={()=>setProducts((s)=>({...s,[p.name]:Math.max(0,(s[p.name]??0)-1)}))}>−</Button>
                            <Input value={String(products[p.name] ?? 0)} onChange={(e)=>setProducts((s)=>({...s,[p.name]: Math.max(0, parseInt(e.target.value)||0)}))} className="h-7 w-12 text-center p-0 rounded-sm" inputMode="numeric" />
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-sm" onClick={()=>setProducts((s)=>({...s,[p.name]:(s[p.name]??0)+1}))}>+</Button>
                          </div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="h-20" />
        </TabsContent>

        <TabsContent value="burgers" className="mt-6">
          <BurgerConfigurator />
        </TabsContent>

        <TabsContent value="workers" className="mt-6">
          <Card className="bg-card border-border rounded-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><span className="material-symbols-rounded text-primary">schedule</span> KALKULATOR GODZIN</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!payrollReady ? <p className="text-sm text-muted-foreground">Ładowanie...</p> : (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Pracownik</label>
                      <select value={payrollEmp} onChange={(e)=>setPayrollEmp(e.target.value)} className="h-9 w-full rounded-sm border bg-background px-3 text-sm">
                        <option value="">Wybierz</option>
                        {Array.from(new Set((payrollReports as {employees:Record<string,string>}[]).flatMap((r)=>Object.keys(r.employees||{})))).sort().map((n)=><option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Stawka PLN</label><Input value={payrollRate} onChange={(e)=>setPayrollRate(e.target.value)} inputMode="decimal" className="rounded-sm" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Od</label><Input type="date" value={payrollFrom} onChange={(e)=>setPayrollFrom(e.target.value)} className="rounded-sm" /></div>
                    <div className="space-y-1"><label className="text-xs text-muted-foreground">Do</label><Input type="date" value={payrollTo} onChange={(e)=>setPayrollTo(e.target.value)} className="rounded-sm" /></div>
                  </div>
                  {!payrollCalc ? <p className="text-sm text-muted-foreground">Wybierz pracownika i zakres dat.</p> : (
                    <>
                      <div className="grid grid-cols-2 gap-4 rounded-sm bg-[var(--surface-raised)] p-4 border">
                        <div><div className="text-xs text-muted-foreground">GODZINY</div><div className="text-2xl font-bold">{payrollCalc.total.toFixed(1)} h</div></div>
                        <div><div className="text-xs text-muted-foreground">WYPŁATA</div><div className="text-2xl font-bold text-primary">{formatMoney(payrollCalc.amount)}</div></div>
                      </div>
                      <div className="text-xs text-muted-foreground">{payrollCalc.count} zmian • {payrollCalc.count ? (payrollCalc.total/payrollCalc.count).toFixed(1) : "0.0"} h/zmianę</div>
                      <div className="overflow-x-auto rounded-sm border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted"><tr><th className="text-left p-2">Data</th><th className="text-left p-2">Lokal</th><th className="text-left p-2">Zmiana</th><th className="text-right p-2">Godz</th><th className="text-right p-2">Kwota</th></tr></thead>
                          <tbody>{payrollCalc.breakdown.length ? payrollCalc.breakdown.map((b,i)=><tr key={i} className="border-t"><td className="p-2">{b.date}</td><td className="p-2">{b.location}</td><td className="p-2">{b.shift}</td><td className="p-2 text-right">{b.hours.toFixed(1)} h</td><td className="p-2 text-right">{formatMoney(b.amount)}</td></tr>) : <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Brak zmian</td></tr>}</tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* floating bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-card border shadow-[var(--shadow-overlay)] px-3 py-2">
        {hasData && <Button variant="ghost" size="icon" className="rounded-full" onClick={()=>{localStorage.removeItem("burbone_state"); location.reload();}} aria-label="Reset">×</Button>}
        <Button onClick={()=>setShowLocation(true)} className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-full px-6">SKOPIUJ LISTĘ</Button>
      </div>

      <Dialog open={showLocation} onOpenChange={setShowLocation}>
        <DialogContent className="bg-[var(--surface-overlay)] border-border rounded-sm max-w-sm">
          <DialogHeader><DialogTitle>Wybierz punkt</DialogTitle><DialogDescription>Wybierz lokal dla raportu {getTodayKey()}</DialogDescription></DialogHeader>
          <div className="grid gap-2">
            {(["Oświęcim","Osiek"] as const).map((loc)=><Button key={loc} onClick={()=>onGenerate(loc)} className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-sm justify-start gap-2"><span className="material-symbols-rounded">near_me</span> {loc.toUpperCase()}</Button>)}
            <Button variant="outline" onClick={()=>setShowLocation(false)} className="rounded-sm">ANULUJ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-[var(--surface-overlay)] border-border rounded-sm max-w-lg">
          <DialogHeader><DialogTitle>LISTA GOTOWA!</DialogTitle><DialogDescription>Kliknij poniżej, aby skopiować.</DialogDescription></DialogHeader>
          <pre className="max-h-[50vh] overflow-auto rounded-sm bg-[var(--surface-raised)] p-3 text-xs whitespace-pre-wrap">{reportText}</pre>
          {reportError && <p className="text-sm text-[var(--app-danger)]">Zapis do Blob nieudany (sprawdź BURBONE_READ_WRITE_TOKEN): {reportError}. Lista skopiowana lokalnie.</p>}
          <Button onClick={async()=>{await copyText(); setShowSuccess(false);}} className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] rounded-sm w-full">SKOPIUJ</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
