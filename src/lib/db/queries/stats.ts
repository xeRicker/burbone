import { statsService } from "@/lib/stats-service";
import { DateRange } from "@/types/stats";

export async function getTodaysStats() {
    return statsService.getTodayStats();
}

export async function getRevenueData(dateRange: DateRange, locationId?: number) {
    return statsService.getRevenue(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
        locationId || "all"
    );
}

export async function getRevenueHeatmapData(dateRange: DateRange) {
    return statsService.getDailyRevenues(
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
    );
}

export async function getLocationRankings(dateRange: DateRange) {
    return statsService.getRankings(
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
    );
}

export async function getEmployeeWorkLogs(dateRange: DateRange, locationId?: number) {
    return statsService.getWorkLogs(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
        locationId || "all"
    );
}
