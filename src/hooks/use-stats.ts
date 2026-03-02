"use client";

import { useQuery } from '@tanstack/react-query';
import { useStatsFiltersStore } from '@/stores/stats-filters-store';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';
import type { DateRange, DailyRevenueData } from '@/types/stats';

const fetchFromServer = async (endpoint: string, params?: URLSearchParams) => {
    const res = await fetch(`/api/${endpoint}?${params?.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
}

export const useStats = () => {
  const { dateRange, locationId, currentMonth, setCurrentMonth } = useStatsFiltersStore();

  const filterParams = new URLSearchParams({
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
      locationId: String(locationId),
  });

  const todaysStatsQuery = useQuery({
    queryKey: ['stats', 'today'],
    queryFn: () => fetchFromServer('stats/today'),
  });

  const revenueQuery = useQuery({
    queryKey: ['stats', 'revenue', dateRange, locationId],
    queryFn: () => fetchFromServer('stats/revenue', filterParams),
  });

  const rankingsQuery = useQuery({
    queryKey: ['stats', 'rankings', dateRange, locationId],
    queryFn: () => fetchFromServer('stats/rankings', filterParams),
  });

  const workLogsQuery = useQuery({
    queryKey: ['stats', 'work-logs', dateRange, locationId],
    queryFn: () => fetchFromServer('stats/work-logs', filterParams),
  });

  const heatmapFilterParams = new URLSearchParams({
    from: formatISO(startOfMonth(currentMonth), { representation: 'date' }),
    to: formatISO(endOfMonth(currentMonth), { representation: 'date' }),
  });

  const dailyRevenuesQuery = useQuery<DailyRevenueData[]> ({
    queryKey: ['stats', 'daily-revenues', currentMonth],
    queryFn: () => fetchFromServer('stats/daily-revenues', heatmapFilterParams),
  });

  return {
    todaysStatsQuery,
    revenueQuery,
    rankingsQuery,
    workLogsQuery,
    dailyRevenuesQuery,
    filters: { dateRange, locationId, currentMonth },
    setFilters: useStatsFiltersStore.setState, // Zustand's setState can be used for partial updates
    setCurrentMonth,
  };
};
