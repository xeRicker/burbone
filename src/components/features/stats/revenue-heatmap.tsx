"use client";

import * as React from "react";
import { useState } from "react";
import { eachDayOfInterval, format, startOfMonth, endOfMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Euro } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DailyRevenueData } from "@/types/stats";

interface RevenueHeatmapProps {
  data: DailyRevenueData[];
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);

export function RevenueHeatmap({
  data,
  currentMonth,
  onMonthChange,
}: RevenueHeatmapProps) {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDailyRevenue = (date: Date) => {
    return data.find((item) => isSameDay(new Date(item.date), date));
  };

  const getMaxRevenueForColorScale = () => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((item) => item.total));
  };

  const maxRevenue = getMaxRevenueForColorScale();

  const getColorForRevenue = (revenue: number) => {
    if (revenue === 0) return "bg-bg-raised"; // No revenue, base background
    if (maxRevenue === 0) return "bg-primary-subtle"; // Avoid division by zero

    const intensity = revenue / maxRevenue;
    if (intensity < 0.2) return "bg-primary-subtle";
    if (intensity < 0.4) return "bg-orange-800"; // Custom shade, adjust as needed
    if (intensity < 0.6) return "bg-orange-700"; // Custom shade, adjust as needed
    if (intensity < 0.8) return "bg-orange-600"; // Custom shade, adjust as needed
    return "bg-primary";
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-lg font-medium text-text-primary">
          {format(currentMonth, "MMMM yyyy", { locale: pl })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center text-sm font-medium text-text-secondary gap-2 mb-2">
          {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startOfMonth(currentMonth).getDay() === 0 ? 6 : startOfMonth(currentMonth).getDay() - 1 }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-12 w-full rounded-md bg-bg-base"></div>
          ))}
          {daysInMonth.map((day) => {
            const dailyRevenue = getDailyRevenue(day);
            const totalRevenue = dailyRevenue?.total || 0;
            const isHighRevenue = totalRevenue >= 2000; // Threshold for special effect
            const cellColor = getColorForRevenue(totalRevenue);

            return (
              <TooltipProvider key={format(day, "yyyy-MM-dd")}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative h-12 w-full rounded-md flex items-center justify-center cursor-pointer transition-all duration-200",
                        cellColor,
                        isToday(day) && "border-2 border-primary", // Highlight today
                        isHighRevenue && "shadow-primary-glow animate-pulse-slow"
                      )}
                    >
                      <span className={cn("font-semibold", totalRevenue > 0 ? "text-text-on-primary" : "text-text-secondary")}>
                        {format(day, "d")}
                      </span>
                      {isHighRevenue && (
                        <span className="absolute inset-0 rounded-md ring-2 ring-glow-primary animate-pulse-slow"></span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="min-w-[200px]">
                    <p className="text-sm font-semibold">{format(day, "dd MMMM yyyy", { locale: pl })}</p>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center justify-between text-text-secondary">
                        <span>Całkowity:</span>
                        <span className="font-medium text-text-primary">{formatCurrency(totalRevenue)}</span>
                      </p>
                      {dailyRevenue?.byLocation.map((loc) => (
                        <p key={loc.name} className="flex items-center justify-between text-xs text-text-muted">
                          <span>{loc.name}:</span>
                          <span className="font-medium">{formatCurrency(loc.total)}</span>
                        </p>
                      ))}
                      {totalRevenue > 0 && (
                        <p className="flex items-center justify-between text-xs text-text-muted mt-2 border-t border-border-subtle pt-1">
                          <span>Karta:</span>
                          <span className="font-medium">{formatCurrency(dailyRevenue.cardRevenue)}</span>
                        </p>
                      )}
                       {totalRevenue > 0 && (
                        <p className="flex items-center justify-between text-xs text-text-muted">
                          <span>Gotówka:</span>
                          <span className="font-medium">{formatCurrency(dailyRevenue.total - dailyRevenue.cardRevenue)}</span>
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
           {Array.from({ length: 7 - (endOfMonth(currentMonth).getDay() === 0 ? 7 : endOfMonth(currentMonth).getDay()) }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-12 w-full rounded-md bg-bg-base"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
