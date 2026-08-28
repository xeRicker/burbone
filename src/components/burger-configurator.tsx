"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Beef = { fatRatio: number; proteinRatio: number; carbsRatio: number };
type Product = { label: string; unitLabel: string; unitGrams: number; beef?: boolean; fryable?: boolean; macros?: { calories: number; fat: number; carbs: number; protein: number }; note?: string };
type Preset = { label: string; ingredients: { id: string; qty: number | { small: number; large: number } }[] };
type Config = { beef: Beef; products: Record<string, Product>; presets: Record<string, Preset> };

function calcBeef(beef: Beef, grams: number, retain: number) {
  const rawFat = grams * beef.fatRatio; const ret = rawFat * (retain/100); const prot = grams*beef.proteinRatio; const carbs = grams*beef.carbsRatio;
  return { calories: ret*9+prot*4+carbs*4, fat: ret, carbs, protein: prot };
}
function scale(macros: Product["macros"], grams: number) {
  if (!macros) return { calories:0,fat:0,carbs:0,protein:0};
  const f=grams/100; return { calories: macros.calories*f, fat: macros.fat*f, carbs: macros.carbs*f, protein: macros.protein*f };
}
function addOil(m: ReturnType<typeof scale>, oil: number){ return { calories: m.calories+oil*9, fat: m.fat+oil, carbs:m.carbs, protein:m.protein };}
export function BurgerConfigurator(){
  const [cfg,setCfg]=useState<Config|null>(null);
  const [preset,setPreset]=useState("classic");
  const [size,setSize]=useState<"small"|"large">("small");
  const [sauce,setSauce]=useState("mayoSauce");
  const [ingredient,setIngredient]=useState("bun");
  const [qty,setQty]=useState(1);
  const [fat,setFat]=useState(75);
  const [oil,setOil]=useState(8);
  const [items,setItems]=useState<{id:number; productId:string; qty:number; fried:boolean}[]>([]);
  const [nextId,setNextId]=useState(1);
  useEffect(()=>{ fetch("/database/burgers.json").then(r=>r.json()).then((j:Config)=>{ setCfg(j); const p=Object.keys(j.presets)[0]; if(p) setPreset(p); const prod=Object.keys(j.products)[0]; if(prod) setIngredient(prod); }); },[]);
  if(!cfg) return <p className="text-sm text-muted-foreground">Ładowanie burgerów...</p>;
  const add = (pid:string, q:number)=>{
    const prod=cfg.products[pid]; if(!prod) return;
    setItems(prev=>{ const ex=prev.find(x=>x.productId===pid); if(ex) return prev.map(x=>x.productId===pid?{...x,qty:x.qty+q}:x); return [...prev,{id:nextId, productId:pid, qty:q, fried: !!prod.fryable}]; });
    setNextId(n=>n+1);
  };
  const applyPreset=()=>{
    const p=cfg.presets[preset]; if(!p) return;
    const newItems: typeof items=[]; let nid=nextId;
    p.ingredients.forEach(e=>{
      let pid=e.id; if(pid==="sauce") pid=sauce; if(pid==="beef") pid=size==="large"?"beefLarge":"beefSmall";
      let q=typeof e.qty==="number"? e.qty : (e.qty[size] ?? 0);
      const ex=newItems.find(x=>x.productId===pid);
      if(ex) ex.qty+=q; else { const prod=cfg.products[pid]; newItems.push({id:nid++, productId:pid, qty:q, fried: !!prod?.fryable}); }
    });
    setItems(newItems); setNextId(nid);
  };
  const calc = (it: typeof items[number])=>{
    const prod=cfg.products[it.productId]!; const grams=prod.unitGrams*it.qty;
    const base = prod.beef ? calcBeef(cfg.beef, grams, fat) : scale(prod.macros, grams);
    const added = prod.fryable && it.fried ? grams*(oil/100) : 0;
    const m=addOil(base, added);
    return { label: prod.label, grams, qty: it.qty, unit: prod.unitLabel, ...m, added, fried: it.fried, fryable: !!prod.fryable };
  };
  const rows=items.map(calc);
  const totals=rows.reduce((a,r)=>({calories:a.calories+r.calories, fat:a.fat+r.fat, carbs:a.carbs+r.carbs, protein:a.protein+r.protein, grams:a.grams+r.grams}), {calories:0,fat:0,carbs:0,protein:0,grams:0});
  const fmt=(n:number)=> n.toLocaleString("pl-PL",{maximumFractionDigits:n>=10?0:1});
  return (
    <div className="space-y-4">
      <Card className="bg-card border-border rounded-sm"><CardHeader><CardTitle className="text-sm">BURGERY — preset</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Preset</label><select value={preset} onChange={e=>setPreset(e.target.value)} className="h-9 w-full rounded-sm border bg-background px-2 text-sm">{Object.entries(cfg.presets).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Rozmiar</label><select value={size} onChange={e=>setSize(e.target.value as never)} className="h-9 w-full rounded-sm border bg-background px-2 text-sm"><option value="small">Mały</option><option value="large">Duży</option></select></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Sos</label><select value={sauce} onChange={e=>setSauce(e.target.value)} className="h-9 w-full rounded-sm border bg-background px-2 text-sm"><option value="mayoSauce">Majonez</option><option value="ketchup">Ketchup</option></select></div>
        <Button onClick={applyPreset} className="md:col-span-3 bg-primary text-primary-foreground rounded-sm">Dodaj preset</Button>
      </CardContent></Card>

      <Card className="bg-card border-border rounded-sm"><CardHeader><CardTitle className="text-sm">Opcje smażenia</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div><label className="text-xs text-muted-foreground">Wysmażenie: {fat>=85?"Mało":fat<=60?"Mocno":"Średnio"} ({fat}%)</label><input type="range" min={50} max={95} step={5} value={fat} onChange={e=>setFat(Number(e.target.value))} className="w-full" /></div>
        <div><label className="text-xs text-muted-foreground">Olej: {oil} g / 100g</label><input type="range" min={0} max={20} step={1} value={oil} onChange={e=>setOil(Number(e.target.value))} className="w-full" /></div>
      </CardContent></Card>

      <Card className="bg-card border-border rounded-sm"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Składniki</CardTitle><Button variant="outline" size="sm" className="rounded-sm" onClick={()=>setItems([])}>Wyczyść</Button></CardHeader><CardContent className="space-y-3">
        <div className="flex gap-2">
          <select value={ingredient} onChange={e=>setIngredient(e.target.value)} className="h-9 flex-1 rounded-sm border bg-background px-2 text-sm">{Object.entries(cfg.products).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <Input type="number" min={1} value={qty} onChange={e=>setQty(Math.max(1, Number(e.target.value)||1))} className="h-9 w-20 rounded-sm" />
          <Button onClick={()=>{add(ingredient, qty); setQty(1);}} className="bg-primary rounded-sm">+</Button>
        </div>
        <div className="space-y-2">{!rows.length ? <p className="text-sm text-muted-foreground">Dodaj preset albo składniki.</p> : rows.map((r,i)=>(
          <div key={items[i].id} className="flex items-center justify-between rounded-sm border bg-[var(--surface-raised)] p-2">
            <div><div className="text-sm font-medium">{r.label}</div><div className="text-xs text-muted-foreground">{fmt(r.grams)} g · {r.qty} {r.unit} · {Math.round(r.calories)} kcal</div></div>
            <div className="flex gap-1">
              {r.fryable && <Button size="sm" variant={items[i].fried?"default":"outline"} className="h-7 w-7 p-0 rounded-sm" onClick={()=>setItems(a=>a.map(x=>x.id===items[i].id?{...x,fried:!x.fried}:x))}>{items[i].fried?"🔥":"♨"}</Button>}
              <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-sm" onClick={()=>setItems(a=>a.map(x=>x.id===items[i].id?{...x,qty:Math.max(0,x.qty-1)}:x).filter(x=>x.qty>0))}>−</Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-sm" onClick={()=>setItems(a=>a.map(x=>x.id===items[i].id?{...x,qty:x.qty+1}:x))}>+</Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm" onClick={()=>setItems(a=>a.filter(x=>x.id!==items[i].id))}>×</Button>
            </div>
          </div>
        ))}</div>
      </CardContent></Card>

      <Card className="bg-card border-border rounded-sm"><CardHeader><CardTitle className="text-sm">Makro — {Math.round(totals.calories)} kcal</CardTitle></CardHeader><CardContent className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-sm bg-[var(--surface-raised)] p-3"><div className="text-xs text-muted-foreground">Białko</div><div className="font-bold">{fmt(totals.protein)} g</div></div>
        <div className="rounded-sm bg-[var(--surface-raised)] p-3"><div className="text-xs text-muted-foreground">Tłuszcz</div><div className="font-bold">{fmt(totals.fat)} g</div></div>
        <div className="rounded-sm bg-[var(--surface-raised)] p-3"><div className="text-xs text-muted-foreground">Węgle</div><div className="font-bold">{fmt(totals.carbs)} g</div></div>
        <div className="rounded-sm bg-[var(--surface-raised)] p-3"><div className="text-xs text-muted-foreground">Gramy</div><div className="font-bold">{fmt(totals.grams)} g</div></div>
      </CardContent></Card>
    </div>
  );
}
