export type DateRange = { from: Date; to: Date };
export type RevenueData = { 
  total: number; 
  cardTotal: number;
  byDate: { date: string; total: number }[];
  byLocation: { name: string; total: number }[]; 
  reportsCount: number;
};
export type HeatmapData = { date: string; location: string; revenue: number; }[];
export type LocationRanking = { id: number; name: string; total: number; }[];
export type EmployeeWorkLog = { employeeName: string; totalHours: number; estimatedPay: number; };
export type TodaysStats = {
    totalRevenue: number;
    revenueByLocation: { name: string; total: number; }[];
    employeesToday: string[];
}
export type DailyRevenueData = {
  date: string;
  total: number;
  cardRevenue: number;
  byLocation: { name: string; total: number }[];
};
