import { jsonDb } from "./json-db";
import { isWithinInterval, parseISO, startOfDay, endOfDay, parse } from "date-fns";

export const statsService = {
  async getRevenue(from: string, to: string, locationId?: number | "all") {
    const reports = await jsonDb.getReports();
    const startDate = startOfDay(parseISO(from));
    const endDate = endOfDay(parseISO(to));

    const filtered = reports.filter((r: any) => {
      const reportDate = parse(r.date, 'yyyy-MM-dd', new Date());
      const inDateRange = isWithinInterval(reportDate, { start: startDate, end: endDate });
      const matchesLocation = !locationId || locationId === "all" || r.locationId === locationId;
      return inDateRange && matchesLocation;
    });

    const total = filtered.reduce((acc: number, r: any) => acc + (Number(r.revenue) || 0), 0);
    const cardTotal = filtered.reduce((acc: number, r: any) => acc + (Number(r.cardRevenue) || 0), 0);

    const byDateMap = new Map<string, number>();
    filtered.forEach((r: any) => {
      const current = byDateMap.get(r.date) || 0;
      byDateMap.set(r.date, current + (Number(r.revenue) || 0));
    });

    const byDate = Array.from(byDateMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const locations = await jsonDb.getLocations();
    const byLocationMap = new Map<number, number>();
    filtered.forEach((r: any) => {
      const current = byLocationMap.get(r.locationId) || 0;
      byLocationMap.set(r.locationId, current + (Number(r.revenue) || 0));
    });

    const byLocation = Array.from(byLocationMap.entries())
      .map(([id, total]) => ({ 
        name: locations.find((l: any) => l.id === id)?.name || "Nieznany", 
        total 
      }));

    return {
      total,
      cardTotal,
      byDate,
      byLocation,
      reportsCount: filtered.length
    };
  },

  async getRankings(from: string, to: string) {
    const reports = await jsonDb.getReports();
    const locations = await jsonDb.getLocations();
    const startDate = startOfDay(parseISO(from));
    const endDate = endOfDay(parseISO(to));

    const locationTotals = new Map<number, number>();

    reports.forEach((r: any) => {
      const reportDate = parse(r.date, 'yyyy-MM-dd', new Date());
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        const current = locationTotals.get(r.locationId) || 0;
        locationTotals.set(r.locationId, current + (Number(r.revenue) || 0));
      }
    });

    const rankings = locations
      .map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        total: locationTotals.get(loc.id) || 0
      }))
      .sort((a: any, b: any) => b.total - a.total);

    return rankings;
  },

  async getWorkLogs(from: string, to: string, locationId?: number | "all") {
    const reports = await jsonDb.getReports();
    const employees = await jsonDb.getEmployees();
    const startDate = startOfDay(parseISO(from));
    const endDate = endOfDay(parseISO(to));

    const employeeStats = new Map<number, { totalHours: number, name: string, hourlyRate: number }>();

    reports.forEach((r: any) => {
      const reportDate = parse(r.date, 'yyyy-MM-dd', new Date());
      const inDateRange = isWithinInterval(reportDate, { start: startDate, end: endDate });
      const matchesLocation = !locationId || locationId === "all" || r.locationId === locationId;

      if (inDateRange && matchesLocation && r.workLogs) {
        r.workLogs.forEach((log: any) => {
          const stats = employeeStats.get(log.employeeId) || { 
            totalHours: 0, 
            name: employees.find((e: any) => e.id === log.employeeId)?.name || "Nieznany",
            hourlyRate: Number(employees.find((e: any) => e.id === log.employeeId)?.hourlyRate) || 29
          };
          stats.totalHours += Number(log.hoursWorked) || 0;
          employeeStats.set(log.employeeId, stats);
        });
      }
    });

    return Array.from(employeeStats.values()).map(stats => ({
      employeeName: stats.name,
      totalHours: stats.totalHours,
      estimatedPay: stats.totalHours * stats.hourlyRate
    })).sort((a, b) => b.totalHours - a.totalHours);
  },

  async getDailyRevenues(from: string, to: string) {
    const reports = await jsonDb.getReports();
    const locations = await jsonDb.getLocations();
    const startDate = startOfDay(parseISO(from));
    const endDate = endOfDay(parseISO(to));

    const dailyData = new Map<string, { total: number, cardRevenue: number, byLocation: any[] }>();

    reports.forEach((r: any) => {
      const reportDate = parse(r.date, 'yyyy-MM-dd', new Date());
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        const dateStr = r.date;
        const current = dailyData.get(dateStr) || { total: 0, cardRevenue: 0, byLocation: [] };
        
        current.total += Number(r.revenue) || 0;
        current.cardRevenue += Number(r.cardRevenue) || 0;
        
        const loc = locations.find((l: any) => l.id === r.locationId);
        current.byLocation.push({
          name: loc?.name || "Nieznany",
          total: Number(r.revenue) || 0
        });
        
        dailyData.set(dateStr, current);
      }
    });

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));
  },

  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const reports = await jsonDb.getReports();
    const locations = await jsonDb.getLocations();
    const employees = await jsonDb.getEmployees();

    const todaysReports = reports.filter((r: any) => r.date === today);
    
    const totalRevenue = todaysReports.reduce((acc: number, r: any) => acc + (Number(r.revenue) || 0), 0);
    const revenueByLocation = todaysReports.map((r: any) => ({
      name: locations.find((l: any) => l.id === r.locationId)?.name || "Nieznany",
      total: Number(r.revenue) || 0
    }));

    const employeeIds = new Set<number>();
    todaysReports.forEach((r: any) => {
      r.workLogs?.forEach((log: any) => employeeIds.add(log.employeeId));
    });

    const employeesToday = Array.from(employeeIds).map(id => 
      employees.find((e: any) => e.id === id)?.name || "Nieznany"
    );

    return {
      totalRevenue,
      revenueByLocation,
      employeesToday
    };
  }
};
