"use client"

import { useState } from "react"
import { GlassPanel } from "@/components/glass/glass-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Copy, RefreshCw, Plus, Minus, Check } from "lucide-react"
import { EMPLOYEES, TIME_PRESETS, CATEGORIES } from "@/lib/constants"

export default function GeneratorPage() {
  const [revenue, setRevenue] = useState("")
  const [cardRevenue, setCardRevenue] = useState("")
  const [employeeShifts, setEmployeeShifts] = useState<Record<string, string>>({})
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  const handleCopy = () => {
    // Implement copy logic
    console.log("Copy list")
  }

  const handleReset = () => {
    setRevenue("")
    setCardRevenue("")
    setEmployeeShifts({})
    setProductCounts({})
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-5 space-y-6">
      <header className="flex justify-between items-center bg-surface p-5 rounded-md border border-[#333] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <h1 className="text-[22px] text-primary font-heading m-0">Generator Listy</h1>
        <Button variant="secondary" size="sm" icon={Settings} onClick={() => window.location.href = "/admin"}>
          Admin
        </Button>
      </header>

      <GlassPanel>
        <h2 className="text-lg text-text-secondary mb-4">💰 Utarg</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="Suma" 
            icon="PLN" 
            type="number" 
            placeholder="0.00" 
            step="0.01" 
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          />
          <Input 
            label="Karty" 
            icon="PLN" 
            type="number" 
            placeholder="0.00" 
            step="0.01" 
            value={cardRevenue}
            onChange={(e) => setCardRevenue(e.target.value)}
          />
        </div>
      </GlassPanel>

      <GlassPanel>
        <h2 className="text-lg text-text-secondary mb-4">👨‍🍳 Ekipa</h2>
        <div className="flex flex-col gap-3">
          {EMPLOYEES.map(emp => {
            const isActive = !!employeeShifts[emp]
            return (
              <div 
                key={emp} 
                className={`flex flex-col sm:flex-row gap-3 p-3 rounded-md transition-all border ${isActive ? 'bg-primary/5 border-primary' : 'bg-bg border-transparent'}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-bg bg-text-secondary shrink-0 font-heading">
                    {emp.charAt(0)}
                  </div>
                  <span className="flex-1 font-medium font-body">{emp}</span>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-[#222] border border-[#333] text-white rounded-md py-2 px-1 text-center font-body outline-none w-[110px]"
                      value={employeeShifts[emp] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setEmployeeShifts(prev => {
                          if (!val) {
                            const next = { ...prev }
                            delete next[emp]
                            return next
                          }
                          return { ...prev, [emp]: val }
                        })
                      }}
                    >
                      <option value="">- brak -</option>
                      {TIME_PRESETS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </GlassPanel>

      {Object.entries(CATEGORIES).map(([catIcon, category]) => (
        <div key={catIcon}>
          <h3 className="mt-8 mb-3 text-xl text-text-primary font-heading">{catIcon}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.items.map(product => {
              const count = productCounts[product.name] || 0
              const isActive = count > 0

              return (
                <div 
                  key={product.name}
                  className={`bg-surface rounded-md p-3 flex justify-between items-center transition-all border min-h-[72px] cursor-pointer select-none ${isActive ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(211,84,0,0.15)]' : 'border-[#333] hover:bg-surface-active'}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.counter')) return;
                    setProductCounts(prev => {
                      const current = prev[product.name] || 0
                      return { ...prev, [product.name]: current === 0 ? 1 : 0 }
                    })
                  }}
                >
                  <div className="flex items-center flex-1">
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mr-3 transition-all ${isActive ? 'bg-success border-success text-white' : 'border-text-muted'}`}>
                      {isActive && <Check strokeWidth={2} className="w-4 h-4" />}
                    </div>
                    <span className={`text-base font-body leading-tight pr-2 ${isActive ? 'text-primary font-bold' : ''}`}>
                      {product.name}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="counter flex items-center justify-between bg-[#0d0d0d] rounded-pill p-1 w-[130px] h-11 shrink-0" onClick={e => e.stopPropagation()}>
                      <button 
                        className="w-9 h-9 rounded-full bg-surface-active text-danger flex items-center justify-center text-xl font-heading active:bg-primary active:text-white"
                        onClick={() => setProductCounts(prev => ({ ...prev, [product.name]: Math.max(0, count - 1) }))}
                      >
                        <Minus strokeWidth={2} className="w-5 h-5" />
                      </button>
                      <input 
                        type="number" 
                        className="w-full bg-transparent border-none text-center text-lg font-bold p-0 text-text-primary outline-none" 
                        value={count}
                        onChange={(e) => setProductCounts(prev => ({ ...prev, [product.name]: parseInt(e.target.value) || 0 }))}
                      />
                      <button 
                        className="w-9 h-9 rounded-full bg-surface-active text-success flex items-center justify-center text-xl font-heading active:bg-primary active:text-white"
                        onClick={() => setProductCounts(prev => ({ ...prev, [product.name]: count + 1 }))}
                      >
                        <Plus strokeWidth={2} className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent flex justify-center gap-4 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-end gap-4">
          {(revenue || cardRevenue || Object.keys(employeeShifts).length > 0 || Object.keys(productCounts).length > 0) && (
            <Button variant="icon" size="icon" icon={RefreshCw} onClick={handleReset} className="text-danger" />
          )}
          <Button size="lg" icon={Copy} onClick={handleCopy}>
            Skopiuj Listę
          </Button>
        </div>
      </div>
    </div>
  )
}
