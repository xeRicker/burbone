'use client';

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useConfigStore } from "@/stores/use-config-store";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parse, isSameDay, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, isWithinInterval, getDay, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

export default function StatsPage() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { employees, locations } = useConfigStore();

  const [currentMonthStr, setCurrentMonthStr] = React.useState<string>("");
  const [selectedWeek, setSelectedWeek] = React.useState<string>('all'); // 'all' or week index '0', '1'...
  
  // Payout Calculator State
  const [payoutStart, setPayoutStart] = React.useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [payoutEnd, setPayoutEnd] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar');

  React.useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        if (data.length > 0) {
          const available = new Set<string>();
          data.forEach((r: any) => {
             try {
               const d = parse(r.date, 'dd.MM.yyyy', new Date());
               if (!isNaN(d.getTime())) available.add(format(d, 'yyyy-MM'));
             } catch(e) {}
          });
          const sorted = Array.from(available).sort().reverse();
          if (sorted.length > 0) {
            setCurrentMonthStr(sorted[0]!);
            // Update payout dates to match this latest month
            const latestMonthDate = parse(sorted[0]!, 'yyyy-MM', new Date());
            setPayoutStart(format(startOfMonth(latestMonthDate), 'yyyy-MM-dd'));
            setPayoutEnd(format(endOfMonth(latestMonthDate), 'yyyy-MM-dd'));
          } else {
             setCurrentMonthStr(format(new Date(), 'yyyy-MM'));
          }
        } else {
           setCurrentMonthStr(format(new Date(), 'yyyy-MM'));
        }
      })
      .catch(() => {
         setReports([]);
         setCurrentMonthStr(format(new Date(), 'yyyy-MM'));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !currentMonthStr) {
    return <div className="p-6 text-primary animate-pulse">Ładowanie statystyk...</div>;
  }

  const parseDate = (dateStr: string) => parse(dateStr, 'dd.MM.yyyy', new Date());

  // Filter reports for the selected month
  const monthDate = parse(currentMonthStr, 'yyyy-MM', new Date());
  const mStart = startOfMonth(monthDate);
  const mEnd = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });

  const monthReports = reports.filter(r => {
    const d = parseDate(r.date);
    return isWithinInterval(d, { start: mStart, end: mEnd });
  });

  // Calculate Weeks for the selected month
  const weeks: Date[][] = [];
  let currentWk: Date[] = [];
  daysInMonth.forEach(d => {
    currentWk.push(d);
    if (getDay(d) === 0 || isSameDay(d, mEnd)) { // Sunday or end of month
      weeks.push(currentWk);
      currentWk = [];
    }
  });

  // Filter by selected week
  let activeReports = monthReports;
  let activeDays = daysInMonth;
  if (selectedWeek !== 'all') {
    const wkIdx = parseInt(selectedWeek);
    if (weeks[wkIdx]) {
      activeDays = weeks[wkIdx]!;
      activeReports = monthReports.filter(r => {
        const d = parseDate(r.date);
        return activeDays.some(ad => isSameDay(d, ad));
      });
    }
  }

  // Payout & Hours Calculator helpers
  const calculateHours = (timeStr: string) => {
    if (!timeStr) return 0;
    const normalizedTime = timeStr.replace('–', '-');
    if (!normalizedTime.includes('-')) return 0;
    const [start, end] = normalizedTime.split('-').map(t => t.trim());
    if(!start || !end) return 0;
    
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let hours = (h2 || 0) - (h1 || 0);
    let minutes = (m2 || 0) - (m1 || 0);
    if (minutes < 0) { hours--; minutes += 60; }
    if (hours < 0) hours += 24;
    return hours + (minutes / 60);
  };

  // Metrics for selected period
  const totalRev = activeReports.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
  const totalCardRev = activeReports.reduce((sum, r) => sum + (Number(r.cardRevenue) || 0), 0);
  
  const locRevs: Record<string, { total: number, card: number }> = {};
  activeReports.forEach(r => {
    if (!locRevs[r.location]) locRevs[r.location] = { total: 0, card: 0 };
    locRevs[r.location]!.total += (Number(r.revenue) || 0);
    locRevs[r.location]!.card += (Number(r.cardRevenue) || 0);
  });

  // Trivia
  const dayRevs = [0,0,0,0,0,0,0];
  activeReports.forEach(r => {
    const d = parseDate(r.date);
    const day = getDay(d);
    if (day >= 0 && day <= 6) {
       dayRevs[day] = (dayRevs[day] || 0) + (Number(r.revenue) || 0);
    }
  });
  const bestDayIdx = dayRevs.indexOf(Math.max(...dayRevs));
  const daysPl = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const bestDayName = Math.max(...dayRevs) > 0 ? daysPl[bestDayIdx] : 'brak danych';

  // Heatmap Data
  const getDayData = (date: Date) => {
    const dayReports = monthReports.filter(r => isSameDay(parseDate(r.date), date));
    const rev = dayReports.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
    const empsInfo: string[] = [];
    
    dayReports.forEach(r => {
      if (r.employees) {
        Object.entries(r.employees).forEach(([eId, timeStr]: [string, any]) => {
          const h = calculateHours(timeStr);
          const name = employees.find(e => e.id === eId)?.name || eId;
          empsInfo.push(`${name} ${h.toFixed(1)}h (${r.location})`);
        });
      }
    });
    return { rev, empsInfo, reports: dayReports };
  };

  const getHeatmapColor = (rev: number) => {
    if (rev === 0) return 'bg-bg-raised text-text-disabled border-transparent';
    if (rev >= 3000) return 'bg-primary border-primary text-on-primary shadow-glow-primary font-bold';
    if (rev >= 2000) return 'bg-tertiary text-on-tertiary border-tertiary font-bold';
    if (rev >= 1000) return 'bg-primary-subtle border-primary text-primary';
    return 'bg-bg-elevated border-border-subtle text-text-primary';
  };

  const payoutData: Record<string, { hours: number, salary: number, locs: Record<string, number> }> = {};
  const startPDate = parse(payoutStart, 'yyyy-MM-dd', new Date());
  const endPDate = parse(payoutEnd, 'yyyy-MM-dd', new Date());
  endPDate.setHours(23, 59, 59, 999);

  reports.forEach(r => {
    const rDate = parseDate(r.date);
    if (rDate >= startPDate && rDate <= endPDate) {
      if (r.employees) {
        Object.entries(r.employees).forEach(([eId, timeStr]: [string, any]) => {
          const h = calculateHours(timeStr);
          const empConfig = employees.find(e => e.id === eId || e.name === eId);
          const rate = empConfig?.rate || 29;
          const realId = empConfig?.id || eId;
          
          if (!payoutData[realId]) payoutData[realId] = { hours: 0, salary: 0, locs: {} };
          payoutData[realId]!.hours += h;
          payoutData[realId]!.salary += h * rate;
          payoutData[realId]!.locs[r.location] = (payoutData[realId]!.locs[r.location] || 0) + h;
        });
      }
    }
  });

  // Daily Report List
  const sortedReports = [...activeReports].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  const reportsByDate: Record<string, any[]> = {};
  sortedReports.forEach(r => {
    if (!reportsByDate[r.date]) reportsByDate[r.date] = [];
    reportsByDate[r.date]!.push(r);
  });

  // Chart Data preparation
  const chartData = activeDays.map(d => {
    const dayReps = activeReports.filter(r => isSameDay(parseDate(r.date), d));
    const total = dayReps.reduce((s, r) => s + (Number(r.revenue)||0), 0);
    const locs: Record<string, number> = {};
    dayReps.forEach(r => {
      locs[r.location] = (locs[r.location] || 0) + (Number(r.revenue) || 0);
    });
    return { date: format(d, 'd'), total, locs };
  });
  const maxChartRev = Math.max(...chartData.map(d => d.total), 100);

  const getLocationColor = (locName: string) => {
    const loc = locations.find(l => l.name === locName);
    return loc?.color || '#FF8C42';
  };

  // Available months for dropdown
  const availableMonths = new Set<string>();
  reports.forEach(r => availableMonths.add(format(parseDate(r.date), 'yyyy-MM')));
  availableMonths.add(format(new Date(), 'yyyy-MM')); // always include current
  const monthOptions = Array.from(availableMonths).sort().reverse();

  return (
    <div className="p-4 md:p-6 space-y-8 pb-24 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="headline-large text-primary">Statystyki</h1>
          <p className="text-text-secondary body-medium">Pełny przegląd i analityka punktów</p>
        </div>
      </header>

      {/* Top Filters */}
      <Card variant="filled" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Icon name="calendar_month" className="text-text-secondary" />
          <select 
            value={currentMonthStr}
            onChange={(e) => { setCurrentMonthStr(e.target.value); setSelectedWeek('all'); }}
            className="bg-bg-input h-12 px-4 rounded-lg outline-none flex-1 md:w-48 title-medium cursor-pointer border border-border-default hover:border-primary transition-colors"
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{format(parse(m, 'yyyy-MM', new Date()), 'LLLL yyyy', { locale: pl }).toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setSelectedWeek('all')}
            className={cn("px-4 h-10 rounded-full label-large transition-colors", selectedWeek === 'all' ? "bg-primary text-on-primary" : "bg-bg-elevated hover:bg-hover-overlay")}
          >
            CAŁY MIESIĄC
          </button>
          {weeks.map((wk, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedWeek(idx.toString())}
              className={cn("px-4 h-10 rounded-full label-large transition-colors", selectedWeek === idx.toString() ? "bg-primary text-on-primary" : "bg-bg-elevated hover:bg-hover-overlay")}
            >
              Tydzień {idx + 1}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-5 flex flex-col gap-2 border-b-4 border-primary lg:col-span-2 justify-center">
          <span className="text-text-secondary label-small font-bold uppercase tracking-wider">Utarg całkowity ({selectedWeek === 'all' ? 'Miesiąc' : `Tydzień ${parseInt(selectedWeek)+1}`})</span>
          <div className="flex items-baseline gap-4">
            <span className="display-medium text-primary">{totalRev.toFixed(2)} zł</span>
            <span className="title-medium text-text-muted whitespace-nowrap">(Karty: {totalCardRev.toFixed(2)} zł)</span>
          </div>
          <p className="body-small text-text-muted mt-1">
            💡 Statystycznie najlepszym dniem jest <strong className="text-primary">{bestDayName}</strong>
          </p>
        </Card>
        
        {Object.entries(locRevs).map(([loc, rev]) => (
           <Card key={loc} variant="elevated" className="p-5 flex flex-col gap-1 border-b-4" style={{ borderColor: getLocationColor(loc) }}>
             <span className="text-text-secondary label-small font-bold uppercase tracking-wider">{loc}</span>
             <span className="headline-medium">{rev.total.toFixed(2)} zł</span>
             <span className="label-small text-text-muted">w tym karty: {rev.card.toFixed(2)} zł</span>
           </Card>
        ))}
      </div>

      {/* Chart Visualization */}
      <Card variant="filled" className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="title-large text-primary flex items-center gap-2">
            <Icon name="bar_chart" />
            Wizualizacja utargu
          </h2>
          <div className="flex bg-bg-elevated rounded-lg p-1 border border-border-subtle">
            <button onClick={() => setChartType('bar')} className={cn("px-3 py-1 rounded-md text-sm font-medium transition-colors", chartType === 'bar' ? "bg-primary text-on-primary" : "text-text-secondary hover:text-text-primary")}>Słupki</button>
            <button onClick={() => setChartType('line')} className={cn("px-3 py-1 rounded-md text-sm font-medium transition-colors", chartType === 'line' ? "bg-primary text-on-primary" : "text-text-secondary hover:text-text-primary")}>Liniowy</button>
          </div>
        </div>
        
        <div className="h-72 flex items-end gap-2 md:gap-4 px-2 overflow-x-auto custom-scrollbar pb-2">
          {chartData.map((d, i) => {
            const hPct = Math.max((d.total / maxChartRev) * 100, 2);
            return (
              <div key={i} className="flex-1 min-w-[24px] flex flex-col items-center gap-2 group h-full">
                <div className="relative w-full flex justify-center h-full items-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-bg-highest text-text-primary text-xs p-3 rounded-xl shadow-lg pointer-events-none z-20 whitespace-nowrap border border-border-subtle transition-opacity">
                    <div className="font-bold text-primary mb-1 border-b border-border-subtle pb-1">
                      {d.date} {format(monthDate, 'LLLL', { locale: pl })} (Suma: {d.total.toFixed(2)} zł)
                    </div>
                    {Object.entries(d.locs).map(([l, v], idx) => (
                      <div key={idx} className="flex justify-between gap-4 py-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLocationColor(l) }} />
                          {l}
                        </span>
                        <span className="font-medium">{v.toFixed(2)} zł</span>
                      </div>
                    ))}
                  </div>
                  
                  {chartType === 'bar' ? (
                    <div className="w-full max-w-[40px] flex flex-col justify-end transition-all duration-500 rounded-t-sm overflow-hidden" style={{ height: `${hPct}%` }}>
                      {Object.entries(d.locs).map(([l, v], idx) => {
                        const segmentPct = (v / d.total) * 100;
                        return (
                          <div 
                            key={idx} 
                            style={{ height: `${segmentPct}%`, backgroundColor: getLocationColor(l) }} 
                            className="w-full hover:brightness-110 transition-all"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                       <div className="w-3 h-3 rounded-full bg-primary mb-1 z-10" style={{ marginBottom: `${hPct}%` }} />
                       {i < chartData.length - 1 && (
                          <div className="absolute w-full h-[2px] bg-primary/50 top-1/2 left-1/2 origin-left" style={{ bottom: `${hPct}%` }} />
                       )}
                    </div>
                  )}
                </div>
                <span className="label-small text-text-muted">{d.date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heatmap */}
        <Card variant="outlined" className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="title-large text-primary flex items-center gap-2">
              <Icon name="calendar_month" />
              Mapa Cieplna ({format(monthDate, 'LLLL', { locale: pl })})
            </h2>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
              <div key={d} className="text-center label-medium text-text-muted pb-2">{d}</div>
            ))}
            
            {Array.from({ length: (mStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent" />
            ))}

            {daysInMonth.map((day) => {
              const data = getDayData(day);
              const isTdy = isToday(day);
              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "group relative aspect-square rounded-lg md:rounded-xl border flex flex-col items-center justify-center transition-all cursor-default",
                    getHeatmapColor(data.rev),
                    isTdy && "ring-2 ring-white ring-offset-2 ring-offset-bg-raised"
                  )}
                >
                  <span className="label-large opacity-80">{format(day, 'd')}</span>
                  {data.rev > 0 && <span className="text-[8px] md:text-[10px] mt-1">{data.rev}</span>}
                  
                  {data.rev > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[260px] bg-bg-highest text-text-primary text-xs p-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-border-subtle">
                      <div className="font-bold text-primary mb-1 border-b border-border-subtle pb-1">
                        {format(day, 'dd.MM.yyyy')} (Utarg: {data.rev} zł)
                      </div>
                      {data.reports.map((r: any, idx: number) => (
                        <div key={idx} className="flex justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1 text-text-secondary">
                             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLocationColor(r.location) }} />
                             {r.location}
                          </span>
                          <span className="font-medium text-success">{r.revenue} zł <span className="text-text-muted text-[10px]">(K: {r.cardRevenue || 0})</span></span>
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t border-border-subtle text-text-muted leading-relaxed flex flex-col gap-1">
                        <span className="font-bold text-text-primary mb-1">Ekipa (Godziny):</span>
                        {data.empsInfo.map((info, i) => <span key={i}>{info}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Payout Calculator */}
        <Card variant="outlined" className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="title-large text-primary flex items-center gap-2">
              <Icon name="payments" />
              Kalkulator Wypłat
            </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-bg-input p-2 rounded-xl border border-border-default">
             <div className="flex-1 flex flex-col">
               <span className="label-small text-text-muted px-2">Od daty</span>
               <input 
                type="date" 
                value={payoutStart}
                onChange={e => setPayoutStart(e.target.value)}
                className="bg-transparent text-text-primary px-2 outline-none [color-scheme:dark] body-large"
              />
             </div>
             <div className="w-px h-8 bg-border-subtle" />
             <div className="flex-1 flex flex-col">
               <span className="label-small text-text-muted px-2">Do daty</span>
               <input 
                type="date" 
                value={payoutEnd}
                onChange={e => setPayoutEnd(e.target.value)}
                className="bg-transparent text-text-primary px-2 outline-none [color-scheme:dark] body-large"
              />
             </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
            {Object.entries(payoutData).sort((a,b) => b[1].salary - a[1].salary).map(([id, data]) => {
              const empConfig = employees.find(e => e.id === id || e.name === id);
              const name = empConfig?.name || id;
              const maxLoc = Object.entries(data.locs).sort((a,b)=>b[1]-a[1])[0];
              const pct = Math.min((data.hours / 160) * 100, 100).toFixed(0);

              return (
                <div key={id} className="p-4 bg-bg-raised rounded-xl flex items-center justify-between border border-border-subtle hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: empConfig?.color || '#888' }}
                    >
                      {name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="title-medium">{name}</h3>
                      <span className="text-text-muted label-small">
                        {data.hours.toFixed(1)}h • {pct}% etatu
                      </span>
                      {maxLoc && (
                        <span className="text-text-secondary text-[10px]">
                          Najczęściej: {maxLoc[0]} ({maxLoc[1]!.toFixed(0)}h)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="title-large text-success">{data.salary.toFixed(2)}</div>
                    <span className="text-[10px] text-text-muted">PLN</span>
                  </div>
                </div>
              );
            })}
            {Object.keys(payoutData).length === 0 && (
              <div className="py-8 text-center text-text-muted border border-dashed border-border-subtle rounded-xl">
                Brak danych o godzinach.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Daily Reports List */}
      <Card variant="outlined" className="p-6 space-y-6">
         <h2 className="title-large text-primary flex items-center gap-2 mb-6">
            <Icon name="receipt_long" />
            Raport Dzienny ({selectedWeek === 'all' ? 'Cały miesiąc' : `Tydzień ${parseInt(selectedWeek)+1}`})
         </h2>
         
         <div className="space-y-6">
           {Object.keys(reportsByDate).sort((a,b) => parseDate(b).getTime() - parseDate(a).getTime()).map(dateStr => {
              const dayReps = reportsByDate[dateStr]!;
              const daySum = dayReps.reduce((s, r) => s + (Number(r.revenue)||0), 0);
              const dayCardSum = dayReps.reduce((s, r) => s + (Number(r.cardRevenue)||0), 0);
              const dateObj = parseDate(dateStr);
              
              return (
                <div key={dateStr} className="border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-bg-raised p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-border-subtle gap-2">
                    <div className="flex items-center gap-3">
                      <span className="headline-small font-bold text-primary">{dateStr}</span>
                      <span className="label-large text-text-muted capitalize bg-bg-elevated px-3 py-1 rounded-full">{daysPl[getDay(dateObj)]}</span>
                    </div>
                    <div className="flex flex-col sm:items-end">
                       <span className="title-large text-success">Utarg: {daySum.toFixed(2)} zł</span>
                       <span className="label-small text-text-secondary">W tym karty: {dayCardSum.toFixed(2)} zł</span>
                    </div>
                  </div>
                  <div className="divide-y divide-border-subtle bg-bg-base">
                    {dayReps.map((r, i) => {
                       const locColor = getLocationColor(r.location);
                       return (
                         <div key={i} className="p-4 flex flex-col sm:flex-row justify-between gap-4 hover:bg-hover-overlay transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: locColor }}>
                                  <Icon name="storefront" size={20} />
                               </div>
                               <div className="flex flex-col">
                                  <span className="title-medium">{r.location}</span>
                                  <span className="label-small text-text-muted">Karty: {r.cardRevenue || 0} zł</span>
                               </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                               <span className="title-medium text-text-primary">{r.revenue} zł</span>
                            </div>
                         </div>
                       );
                    })}
                  </div>
                </div>
              );
           })}
           {Object.keys(reportsByDate).length === 0 && (
             <div className="py-12 text-center text-text-muted border border-dashed border-border-subtle rounded-xl">
                <Icon name="history_toggle_off" size={48} className="mb-4" />
                <p className="title-medium">Brak raportów w wybranym okresie.</p>
             </div>
           )}
         </div>
      </Card>
    </div>
  );
}