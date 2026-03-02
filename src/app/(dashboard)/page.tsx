"use client";

import { useMemo } from "react";
import { useDataStore } from "@/stores/data-store";
import { useStatsFiltersStore } from "@/stores/stats-filters-store";
import { PageHeader } from "@/components/layouts/page-header";
import { StatCard } from "@/components/features/stats/stat-card";
import { RevenueLineChart } from "@/components/features/stats/revenue-line-chart";
import { RevenueHeatmap } from "@/components/features/stats/revenue-heatmap";
import { TrendingUp, TrendingDown, User, Calendar, Banknote } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isWithinInterval, parse, startOfDay, endOfDay, format } from "date-fns";
import { pl } from "date-fns/locale";

const formatCurrency = (value: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);

const FullScreenLoader = () => (
    <div className="fixed inset-0 bg-bg-base z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-primary text-lg">Ładowanie danych...</p>
        </div>
    </div>
);

const StatsDashboard = () => {
    const { locations, reports, employees, isLoaded } = useDataStore();
    const { dateRange, locationId, currentMonth, setDateRange, setLocationId, setCurrentMonth } = useStatsFiltersStore();

    const filteredReports = useMemo(() => {
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        return reports.filter(r => {
            const reportDate = parse(r.date, 'yyyy-MM-dd', new Date());
            const inDateRange = isWithinInterval(reportDate, { start: startDate, end: endDate });
            const matchesLocation = locationId === 'all' || r.locationId === locationId;
            return inDateRange && matchesLocation;
        });
    }, [reports, dateRange, locationId]);

    const revenueData = useMemo(() => {
        const total = filteredReports.reduce((acc, r) => acc + (Number(r.revenue) || 0), 0);
        const byDateMap = new Map<string, number>();
        filteredReports.forEach(r => {
            const current = byDateMap.get(r.date) || 0;
            byDateMap.set(r.date, current + (Number(r.revenue) || 0));
        });
        const byDate = Array.from(byDateMap.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
        return { total, byDate };
    }, [filteredReports]);

    const rankings = useMemo(() => {
        const locationTotals = new Map<number, number>();
        filteredReports.forEach(r => {
            const current = locationTotals.get(r.locationId) || 0;
            locationTotals.set(r.locationId, current + (Number(r.revenue) || 0));
        });
        return locations
            .map(loc => ({ name: loc.name, total: locationTotals.get(loc.id) || 0 }))
            .sort((a, b) => b.total - a.total);
    }, [filteredReports, locations]);

    const workLogs = useMemo(() => {
        const employeeStats = new Map<string, { totalHours: number, name: string, hourlyRate: number }>();
        filteredReports.forEach(r => {
            if (r.workLogs) {
                r.workLogs.forEach(log => {
                    const employee = employees.find(e => e.slug === log.employeeSlug);
                    if (!employee) return;
                    const stats = employeeStats.get(log.employeeSlug) || { totalHours: 0, name: employee.name, hourlyRate: Number(employee.hourlyRate) || 0 };
                    stats.totalHours += Number(log.hoursWorked) || 0;
                    employeeStats.set(log.employeeSlug, stats);
                });
            }
        });
        return Array.from(employeeStats.values()).map(stats => ({ ...stats, estimatedPay: stats.totalHours * stats.hourlyRate })).sort((a, b) => b.totalHours - a.totalHours);
    }, [filteredReports, employees]);

    const todaysStats = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysReports = reports.filter(r => r.date === today);
        const totalRevenue = todaysReports.reduce((acc, r) => acc + (Number(r.revenue) || 0), 0);
        const revenueByLocation = todaysReports.map(r => ({
            name: locations.find(l => l.id === r.locationId)?.name || "Nieznany",
            total: Number(r.revenue) || 0
        }));
        const employeeSlugs = new Set<string>();
        todaysReports.forEach(r => r.workLogs?.forEach(log => employeeSlugs.add(log.employeeSlug)));
        const employeesToday = Array.from(employeeSlugs).map(slug => employees.find(e => e.slug === slug)?.name || "Nieznany");
        return { totalRevenue, revenueByLocation, employeesToday };
    }, [reports, locations, employees]);

    if (!isLoaded) {
        return <FullScreenLoader />;
    }

    return (
        <div>
            <PageHeader title="Centrum Dowodzenia">
                <div className="flex gap-2">
                    <Select onValueChange={(val) => setLocationId(val === 'all' ? 'all' : Number(val))} value={String(locationId)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Wybierz lokalizację" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie</SelectItem>
                            {locations?.map((loc: any) => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <DateRangePicker value={dateRange} onChange={(range) => range && setDateRange(range)} />
                </div>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Utarg (zakres)" value={formatCurrency(revenueData?.total ?? 0)} icon={Banknote} />
                        <StatCard label="Najlepsza lokalizacja" value={rankings?.[0]?.name ?? "Brak danych"} icon={TrendingUp} color="success" />
                        <StatCard label="Najgorsza lokalizacja" value={rankings?.[rankings.length - 1]?.name ?? "Brak danych"} icon={TrendingDown} color="error" />
                    </div>
                    <Card><CardContent className="p-4"><RevenueLineChart data={revenueData} /></CardContent></Card>
                    <Card>
                        <CardHeader><CardTitle>Godziny i szacowane wypłaty (zakres)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {workLogs.length === 0 ? <p className="text-text-muted text-center py-4">Brak danych</p> : workLogs.map(log => (
                                <div key={log.name} className="flex justify-between items-center py-2 border-b border-divider last:border-none">
                                    <p className="flex items-center gap-2 text-text-primary"><User size={16} /> {log.name}</p>
                                    <div className="text-right">
                                        <p className="text-text-primary">{log.totalHours.toFixed(2)}h</p>
                                        <p className="text-sm text-text-secondary">{formatCurrency(log.estimatedPay)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} /> Puls Dnia</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <p className="text-sm text-text-secondary">Dzisiejszy utarg</p>
                                <p className="text-2xl font-bold text-text-primary">{formatCurrency(todaysStats?.totalRevenue ?? 0)}</p>
                            </div>
                            <div className="space-y-2">
                               {todaysStats.revenueByLocation.length === 0 ? <p className="text-text-muted text-sm">Brak raportów</p> : todaysStats.revenueByLocation.map(loc => (
                                    <div key={loc.name} className="flex justify-between text-sm">
                                        <span className="text-text-primary">{loc.name}</span>
                                        <span className="font-medium text-text-primary">{formatCurrency(loc.total)}</span>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <p className="text-sm text-text-secondary mt-4">Pracowali dzisiaj</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                     {todaysStats.employeesToday.length === 0 ? <p className="text-text-muted text-sm">Brak danych</p> : todaysStats.employeesToday.map(name => (
                                        <div key={name} className="bg-bg-highest text-text-primary text-xs rounded-full px-3 py-1">{name}</div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Heatmapa utargu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RevenueHeatmap
                                data={reports}
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default StatsDashboard;
