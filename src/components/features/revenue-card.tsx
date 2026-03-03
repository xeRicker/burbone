'use client';

import { Card } from "@/components/ui/card";
import { useReportStore } from "@/stores/use-report-store";

export function RevenueCard() {
  const { revenue, cardRevenue, setRevenue, setCardRevenue } = useReportStore();

  return (
    <Card className="p-4 space-y-4" variant="elevated">
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-rounded">payments</span>
        <h2 className="title-large">UTARG</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="label-medium text-text-secondary">SUMA</label>
          <div className="flex items-center bg-bg-input rounded-sm px-3 h-14 border-b border-border-default focus-within:border-primary transition-colors">
            <span className="text-text-muted mr-2">PLN</span>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0.00"
              className="w-full body-large outline-none bg-transparent"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label-medium text-text-secondary">KARTY</label>
          <div className="flex items-center bg-bg-input rounded-sm px-3 h-14 border-b border-border-default focus-within:border-primary transition-colors">
            <span className="text-text-muted mr-2">PLN</span>
            <input
              type="number"
              value={cardRevenue}
              onChange={(e) => setCardRevenue(e.target.value)}
              placeholder="0.00"
              className="w-full body-large outline-none bg-transparent"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
