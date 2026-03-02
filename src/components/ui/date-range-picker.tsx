"use client"

import * as React from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar" // To be created
import {
  Popover, // To be created
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.ComponentProps<"div"> {
    value?: DateRange;
    onChange?: (range?: DateRange) => void;
}

export function DateRangePicker({ className, value, onChange }: DateRangePickerProps) {
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outlined"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-text-muted"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y", { locale: pl })} -{" "}
                  {format(value.to, "LLL dd, y", { locale: pl })}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Wybierz zakres dat</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
