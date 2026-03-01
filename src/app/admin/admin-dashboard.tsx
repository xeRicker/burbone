"use client"

import { useState, useMemo } from "react"
import { GlassPanel } from "@/components/glass/glass-panel"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart } from "lucide-react"

// This is a minimal client dashboard for demonstration.
// Full implementation would include the charts from chart.js, etc.
// Extracted to keep files modular and RSC-first.
export default function AdminDashboard({ initialData }: { initialData: any[] }) {
  const [viewMode, setViewMode] = useState<"total" | "cards">("total")
  
  const totalRevenue = useMemo(() => {
    return initialData.reduce((acc, curr) => acc + (viewMode === 'total' ? curr.revenue : curr.cardRevenue), 0)
  }, [initialData, viewMode])

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button 
          variant={viewMode === "total" ? "primary" : "secondary"} 
          onClick={() => setViewMode("total")}
          icon={BarChart}
        >
          Utarg Całkowity
        </Button>
        <Button 
          variant={viewMode === "cards" ? "primary" : "secondary"} 
          onClick={() => setViewMode("cards")}
          icon={LineChart}
        >
          Tylko Karty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel>
          <h3 className="text-sm text-text-muted mb-2 font-heading">Suma Utargu</h3>
          <p className="text-3xl font-bold text-white font-body">
            {totalRevenue.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}
          </p>
        </GlassPanel>
        
        <GlassPanel>
          <h3 className="text-sm text-text-muted mb-2 font-heading">Raportów</h3>
          <p className="text-3xl font-bold text-white font-body">
            {initialData.length}
          </p>
        </GlassPanel>

        <GlassPanel>
          <h3 className="text-sm text-text-muted mb-2 font-heading">Ostatnia Akt.</h3>
          <p className="text-xl font-medium text-white font-body mt-2">
            Właśnie teraz
          </p>
        </GlassPanel>
      </div>

      <GlassPanel>
        <h3 className="text-xl text-text-primary mb-4 font-heading">Wizualizacja (W budowie)</h3>
        <div className="h-[300px] flex items-center justify-center border border-[#333] rounded-md bg-bg">
          <span className="text-text-muted font-body">Miejsce na wykresy</span>
        </div>
      </GlassPanel>
    </div>
  )
}
