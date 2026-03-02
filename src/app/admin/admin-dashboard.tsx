"use client"

import { useState, useMemo } from "react"
import { GlassPanel } from "@/components/glass/glass-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as LucideIcons from "lucide-react"
import { 
  BarChart as BarChartIcon, LineChart as LineChartIcon, Calculator, Clock, 
  CircleDollarSign, Users, MapPin, Package, Save, Plus, Activity, Filter, Calendar
} from "lucide-react"
import { batchUpdateSettings } from "@/app/actions"
import { motion, AnimatePresence } from "motion/react"
import { IconPicker } from "@/components/ui/icon-picker"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

// Helper functions for dates
const getISOWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

export default function AdminDashboard({
  initialData, initialEmployees, initialLocations, initialProducts
}: {
  initialData: any[], initialEmployees: any[], initialLocations: any[], initialProducts: any[]
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "locations" | "employees" | "products">("stats")   

  // ===================== STATS TAB =====================
  const [viewMode, setViewMode] = useState<"total" | "cards">("total")
  const [timeFilter, setTimeFilter] = useState<"all" | "this_week" | "last_week" | "this_month">("all")
  const [calcMonth, setCalcMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  const filteredData = useMemo(() => {
    const now = new Date();
    const currentWeek = getISOWeek(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return initialData.filter(report => {
      if (timeFilter === "all") return true;
      const d = new Date(report.date);
      if (isNaN(d.getTime())) return true; // fallback

      if (timeFilter === "this_month") {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      
      const repWeek = getISOWeek(d);
      if (timeFilter === "this_week") {
        return repWeek === currentWeek && d.getFullYear() === currentYear;
      }
      if (timeFilter === "last_week") {
        return repWeek === (currentWeek - 1) && d.getFullYear() === currentYear;
      }
      return true;
    });
  }, [initialData, timeFilter]);

  const totalRevenue = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (viewMode === 'total' ? Number(curr.revenue) : Number(curr.cardRevenue)), 0)
  }, [filteredData, viewMode])

  const chartData = useMemo(() => {
    const reversedData = [...filteredData].reverse();
    // Group by date to avoid multiple bars for the same day
    const grouped: Record<string, number> = {};
    reversedData.forEach(d => {
      grouped[d.date] = (grouped[d.date] || 0) + (viewMode === 'total' ? Number(d.revenue) : Number(d.cardRevenue));
    });

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: viewMode === 'total' ? 'Suma Utargu (PLN)' : 'Karty (PLN)',
          data: Object.values(grouped),
          backgroundColor: 'rgba(211, 84, 0, 0.5)',
          borderColor: '#D35400',
          borderWidth: 1,
          borderRadius: 8,
        }
      ]
    }
  }, [filteredData, viewMode])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        titleColor: '#D35400',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#888' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#888', maxRotation: 45, minRotation: 45 }
      }
    }
  }

  const locationStats = useMemo(() => {
    const stats: Record<string, { total: number, cards: number }> = {};
    filteredData.forEach(report => {
      const loc = report.location;
      if (!stats[loc]) stats[loc] = { total: 0, cards: 0 };
      stats[loc].total += Number(report.revenue);
      stats[loc].cards += Number(report.cardRevenue);
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  }, [filteredData]);

  // Payroll Calculator
  const payrollStats = useMemo(() => {
    const stats: Record<string, { shifts: number, hours: number, salary: number }> = {};
    
    // Create lookup for rates
    const rateMap: Record<string, number> = {};
    initialEmployees.forEach(emp => {
      rateMap[emp.name] = parseFloat(emp.hourlyRate) || 0;
    });

    initialData.forEach(report => {
      const d = new Date(report.date);
      if (isNaN(d.getTime())) return;
      const repMonth = d.toISOString().slice(0, 7);

      if (repMonth !== calcMonth) return;

      if (report.employees) {
        Object.entries(report.employees).forEach(([emp, shift]) => {
          if (!stats[emp]) stats[emp] = { shifts: 0, hours: 0, salary: 0 };
          stats[emp].shifts += 1;

          try {
            const shiftStr = String(shift).replace("–", "-").replace(" ", "");
            const [start, end] = shiftStr.split("-");
            if (start && end) {
              const [h1, m1] = start.split(":").map(Number);
              const [h2, m2] = end.split(":").map(Number);
              let diff = (h2 + m2/60) - (h1 + m1/60);
              if (diff < 0) diff += 24;
              stats[emp].hours += diff;
            }
          } catch (e) {}
        });
      }
    });

    // Calc salaries
    Object.keys(stats).forEach(emp => {
      stats[emp].salary = stats[emp].hours * (rateMap[emp] || 29);
    });

    return Object.entries(stats).sort((a, b) => b[1].hours - a[1].hours);
  }, [initialData, calcMonth, initialEmployees]);


  // ===================== MANAGEMENT TABS =====================
  const [employees, setEmployees] = useState(initialEmployees);
  const [locations, setLocations] = useState(initialLocations);
  const [products, setProducts] = useState(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleGlobalSave = async () => {
    setIsSaving(true);
    try {
      await batchUpdateSettings({ employees, locations, products });
      setHasChanges(false);
      alert("Zapisano wszystkie zmiany w bazie danych!");
    } catch (err) {
      alert("Błąd podczas zapisu: " + String(err));
    } finally {
      setIsSaving(false);
    }
  }

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  }

  const addNewEmployee = () => { setEmployees([{ id: 0, name: "Nowy", hourlyRate: "29.00", icon: "User", color: "#D35400", isActive: true }, ...employees]); markChanged(); }
  const addNewLocation = () => { setLocations([{ id: 0, name: "Nowy", address: "", icon: "MapPin", color: "#D35400", isActive: true }, ...locations]); markChanged(); }
  const addNewProduct = () => { setProducts([{ id: 0, name: "Nowy", category: "Inne", type: "amount", icon: "Package", isActive: true }, ...products]); markChanged(); }

  const updateItemInState = (setter: any, items: any[], idx: number, field: string, value: any) => {      
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setter(newItems);
    markChanged();
  }

  return (
    <div className="space-y-8 pb-32">

      {/* TABS HEADER */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant={activeTab === "stats" ? "primary" : "secondary"} onClick={() => setActiveTab("stats")}>
          <BarChartIcon className="mr-2 h-5 w-5" /> Statystyki
        </Button>
        <Button variant={activeTab === "locations" ? "primary" : "secondary"} onClick={() => setActiveTab("locations")}>
          <MapPin className="mr-2 h-5 w-5" /> Punkty
        </Button>
        <Button variant={activeTab === "employees" ? "primary" : "secondary"} onClick={() => setActiveTab("employees")}>
          <Users className="mr-2 h-5 w-5" /> Ekipa
        </Button>
        <Button variant={activeTab === "products" ? "primary" : "secondary"} onClick={() => setActiveTab("products")}>
          <Package className="mr-2 h-5 w-5" /> Produkty
        </Button>
      </div>

      {activeTab === "stats" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8"> 
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-black/20 p-4 rounded-[20px] border border-white/5 gap-4">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Button variant={viewMode === "total" ? "primary" : "secondary"} onClick={() => setViewMode("total")} size="sm">
                <BarChartIcon className="mr-2 h-4 w-4" strokeWidth={1.5} /> Utarg
              </Button>
              <Button variant={viewMode === "cards" ? "primary" : "secondary"} onClick={() => setViewMode("cards")} size="sm">
                <LineChartIcon className="mr-2 h-4 w-4" strokeWidth={1.5} /> Karty
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-black/30 rounded-[12px] p-1 border border-white/10 w-full md:w-auto">
              <Filter className="w-4 h-4 text-text-muted ml-2" />
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-transparent text-sm text-text-primary py-2 px-2 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Cały okres</option>
                <option value="this_week">Obecny tydzień</option>
                <option value="last_week">Poprzedni tydzień</option>
                <option value="this_month">Obecny miesiąc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassPanel>
              <h3 className="text-xs text-text-muted mb-2 font-sans uppercase tracking-wider">Suma Utargu</h3>
              <p className="text-4xl font-light text-primary font-sans tracking-tight">
                {totalRevenue.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
              </p>
            </GlassPanel>
            <GlassPanel>
              <h3 className="text-xs text-text-muted mb-2 font-sans uppercase tracking-wider">Raportów (w okresie)</h3>
              <p className="text-4xl font-light text-white font-sans tracking-tight">
                {filteredData.length}
              </p>
            </GlassPanel>
            <GlassPanel>
              <h3 className="text-xs text-text-muted mb-2 font-sans uppercase tracking-wider">Zarobki z Gotówki (Całość - Karty)</h3>
              <p className="text-2xl font-light text-success font-sans mt-3 tracking-tight">
                {filteredData.reduce((acc, curr) => acc + (Number(curr.revenue) - Number(curr.cardRevenue)), 0).toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
              </p>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel>
              <h3 className="text-lg text-text-primary mb-6 font-sans uppercase tracking-wide">Zarobki Punktów (Wybrany Okres)</h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {locationStats.map(([name, stats]) => (
                  <div key={name} className="flex justify-between items-center bg-black/10 p-4 rounded-[16px] border border-white/5">
                    <span className="text-text-primary font-medium">{name}</span>
                    <div className="text-right">
                      <div className="text-primary font-medium">{stats.total.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</div>
                      <div className="text-xs text-text-muted">Karty: {stats.cards.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel>
              <h3 className="text-lg text-text-primary mb-6 font-sans uppercase tracking-wide">Wizualizacja Utargu (Wykres)</h3>
              <div className="h-[250px] w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </GlassPanel>
          </div>

          <GlassPanel>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Calculator className="text-primary w-5 h-5" />
                <h3 className="text-lg text-text-primary font-sans uppercase tracking-wide m-0">Kalkulator Wypłat Ekipy</h3>
              </div>
              
              <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-[12px] px-3 py-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <input 
                  type="month" 
                  className="bg-transparent text-white text-sm outline-none cursor-pointer"
                  value={calcMonth}
                  onChange={(e) => setCalcMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {payrollStats.map(([name, stats]) => {
                const empInfo = employees.find(e => e.name === name);
                const color = empInfo?.color || "#D35400";
                
                return (
                  <div key={name} className="bg-black/20 border border-white/5 rounded-[16px] p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg" style={{ backgroundColor: color }}>
                          {name.charAt(0)}
                        </div>
                        <span className="text-white font-medium text-lg">{name}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted flex items-center gap-1"><Clock className="w-3 h-3"/> Godziny:</span>
                        <span className="text-white font-medium">{stats.hours.toFixed(1)} h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted flex items-center gap-1"><Activity className="w-3 h-3"/> Zmiany:</span>
                        <span className="text-white font-medium">{stats.shifts}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-text-secondary uppercase tracking-wider">Do Wypłaty</span>
                        <span className="text-xl font-medium text-success">
                          {stats.salary.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {payrollStats.length === 0 && (
                <div className="col-span-full text-center py-10 text-text-muted">
                  Brak raportów w wybranym miesiącu.
                </div>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {activeTab === "locations" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"> 
          <div className="flex justify-between items-center mb-6 bg-black/10 p-4 rounded-[16px] border border-white/5">
             <h2 className="text-2xl text-primary font-sans uppercase m-0">Zarządzanie Punktami</h2>
             <Button onClick={addNewLocation}><Plus className="mr-2 h-4 w-4" /> Dodaj Punkt</Button>      
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {locations.map((loc, idx) => (
              <GlassPanel key={idx} className="flex flex-col gap-4 !p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-medium text-white flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: loc.color || '#D35400' }} />
                    {loc.name || 'Nowy punkt'}
                  </h3>
                  <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer bg-black/20 px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/40 transition-colors">
                    <input type="checkbox" checked={loc.isActive} onChange={e => updateItemInState(setLocations, locations, idx, 'isActive', e.target.checked)} className="w-4 h-4 accent-primary" />
                    Aktywny
                  </label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nazwa" value={loc.name} onChange={e => updateItemInState(setLocations, locations, idx, 'name', e.target.value)} />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary font-sans uppercase tracking-wider">Kolor Akcentu</label>
                    <div className="flex gap-3 h-[46px]">
                      <input 
                        type="color" 
                        className="w-full h-full p-0 border-0 rounded-[12px] cursor-pointer bg-transparent overflow-hidden color-picker-custom" 
                        value={loc.color || '#D35400'} 
                        onChange={e => updateItemInState(setLocations, locations, idx, 'color', e.target.value)} 
                      />
                      <div className="flex-1 bg-black/20 border border-white/10 rounded-[12px] flex items-center px-3 font-mono text-sm text-text-muted uppercase">
                        {loc.color || '#D35400'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddressAutocomplete 
                    value={loc.address || ''} 
                    onChange={val => updateItemInState(setLocations, locations, idx, 'address', val)} 
                  />
                  <IconPicker 
                    value={loc.icon} 
                    onChange={val => updateItemInState(setLocations, locations, idx, 'icon', val)} 
                  />
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === "employees" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"> 
          <div className="flex justify-between items-center mb-6 bg-black/10 p-4 rounded-[16px] border border-white/5">
             <h2 className="text-2xl text-primary font-sans uppercase m-0">Zarządzanie Ekipą</h2>
             <Button onClick={addNewEmployee}><Plus className="mr-2 h-4 w-4" /> Dodaj Pracownika</Button> 
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {employees.map((emp, idx) => (
              <GlassPanel key={idx} className="flex flex-col gap-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0" style={{ backgroundColor: emp.color || '#D35400' }}>
                      {emp.name.charAt(0) || '?'}
                    </div>
                    <Input value={emp.name} onChange={e => updateItemInState(setEmployees, employees, idx, 'name', e.target.value)} placeholder="Imię" className="!bg-transparent !border-none !p-0 !text-xl !font-medium" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer mt-2">
                    <input type="checkbox" checked={emp.isActive} onChange={e => updateItemInState(setEmployees, employees, idx, 'isActive', e.target.checked)} className="w-4 h-4 accent-primary" />
                    Aktywny
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Stawka / h (PLN)" type="number" step="0.5" value={emp.hourlyRate} onChange={e => updateItemInState(setEmployees, employees, idx, 'hourlyRate', e.target.value)} />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary font-sans uppercase tracking-wider">Kolor</label>
                    <input 
                      type="color" 
                      className="w-full h-[46px] p-0 border-0 rounded-[12px] cursor-pointer bg-transparent overflow-hidden" 
                      value={emp.color || '#D35400'} 
                      onChange={e => updateItemInState(setEmployees, employees, idx, 'color', e.target.value)} 
                    />
                  </div>
                </div>
                
                <IconPicker 
                  value={emp.icon} 
                  onChange={val => updateItemInState(setEmployees, employees, idx, 'icon', val)} 
                />
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === "products" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"> 
          <div className="flex justify-between items-center mb-6 bg-black/10 p-4 rounded-[16px] border border-white/5">
             <h2 className="text-2xl text-primary font-sans uppercase m-0">Zarządzanie Produktami</h2>       
             <Button onClick={addNewProduct}><Plus className="mr-2 h-4 w-4" /> Dodaj Produkt</Button>     
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products.map((prod, idx) => (
              <GlassPanel key={idx} className="flex flex-col gap-4 !p-5">
                <div className="flex justify-between items-center mb-1">
                  <Input value={prod.name} onChange={e => updateItemInState(setProducts, products, idx, 'name', e.target.value)} placeholder="Nazwa produktu" className="!bg-transparent !border-none !p-0 !text-xl !font-medium" />
                  <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer shrink-0">
                    <input type="checkbox" checked={prod.isActive} onChange={e => updateItemInState(setProducts, products, idx, 'isActive', e.target.checked)} className="w-4 h-4 accent-primary" />
                    Aktywny
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Kategoria" value={prod.category} onChange={e => updateItemInState(setProducts, products, idx, 'category', e.target.value)} />
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-secondary font-sans uppercase tracking-wider">Typ</label>
                    <select
                      className="w-full bg-black/20 border border-white/10 text-white rounded-[12px] h-[46px] px-3 font-sans outline-none appearance-none cursor-pointer focus:border-primary/50 transition-colors"       
                      value={prod.type}
                      onChange={e => updateItemInState(setProducts, products, idx, 'type', e.target.value)} 
                    >
                      <option value="amount">Liczbowe</option>
                      <option value="checkbox">Zaznaczenie</option>
                    </select>
                  </div>
                  
                  <IconPicker 
                    value={prod.icon} 
                    onChange={val => updateItemInState(setProducts, products, idx, 'icon', val)} 
                  />
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {/* FLOATING SAVE BUTTON */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-4 glass-effect rounded-[24px] shadow-[0_10px_40px_rgba(211,84,0,0.3)] border border-primary/50"
          >
            <div className="flex items-center px-4 text-text-primary font-medium tracking-wide whitespace-nowrap">
              Masz niezapisane zmiany
            </div>
            <Button size="lg" onClick={handleGlobalSave} disabled={isSaving}>
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Zapisywanie..." : "Zapisz Wszystko"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
