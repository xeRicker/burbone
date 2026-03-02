"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "motion/react"
import { MapPin, Search } from "lucide-react"

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  label?: string;
}

export function AddressAutocomplete({ value, onChange, label = "Adres z Mapy" }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only fetch if query has changed and is long enough
    if (query === value || query.length < 3) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pl&limit=5`, {
          headers: { "Accept-Language": "pl-PL" }
        })
        const data = await res.json()
        setResults(data || [])
        setIsOpen(true)
      } catch (err) {
        console.error("Nominatim error", err)
      } finally {
        setIsLoading(false)
      }
    }, 600) // Debounce 600ms

    return () => clearTimeout(timer)
  }, [query, value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative flex flex-col gap-2" ref={wrapperRef}>
      <Input
        label={label}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value) // Update parent anyway so manual input works
        }}
        onFocus={() => { if (results.length > 0) setIsOpen(true) }}
      />
      {isLoading && <div className="absolute right-4 top-10 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-[100%] left-0 mt-2 w-full sm:w-[350px] bg-surface-active/95 backdrop-blur-[24px] border border-white/10 rounded-[16px] shadow-2xl p-2 max-h-[300px] overflow-y-auto"
          >
            {results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="w-full text-left p-3 hover:bg-white/10 transition-colors flex items-start gap-3 rounded-[12px]"
                onClick={() => {
                  setQuery(item.display_name)
                  onChange(item.display_name)
                  setIsOpen(false)
                }}
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" strokeWidth={1.5} />
                <span className="text-sm font-sans text-text-primary opacity-90 leading-snug">
                  {item.display_name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
