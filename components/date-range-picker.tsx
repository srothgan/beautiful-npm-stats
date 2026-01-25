"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import { getLatestAvailableDate } from "@/lib/chunk-dates"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DATE_PRESETS, MAX_DATE_RANGE_DAYS } from "@/lib/constants"

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onRangeChange: (start: Date, end: Date) => void
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetClick = (days: number) => {
    // Use yesterday as end date since npm data isn't available for today
    const end = getLatestAvailableDate()
    const start = subDays(end, days - 1)
    onRangeChange(start, end)
  }

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onRangeChange(range.from, range.to)
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Preset buttons */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
        {DATE_PRESETS.map((preset) => {
          const isActive =
            Math.abs(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) -
                (preset.days - 1)
            ) < 1

          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.days)}
              className={cn(
                "px-3 py-1.5 text-sm font-mono font-medium rounded-md transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Custom date picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg",
              "border border-border/50 bg-muted/30",
              "text-sm font-mono text-muted-foreground",
              "hover:border-primary/30 hover:text-foreground",
              "transition-all duration-200",
              isOpen && "border-primary/50 text-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {startDate && endDate ? (
              <span>
                {format(startDate, "MMM d")} – {format(endDate, "MMM d, yyyy")}
              </span>
            ) : (
              <span>Custom range</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-border/50 bg-card/95 backdrop-blur-xl"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={startDate}
            selected={{ from: startDate, to: endDate }}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            disabled={(date) => {
              const latestDate = getLatestAvailableDate()
              return date > latestDate || date < subDays(latestDate, MAX_DATE_RANGE_DAYS)
            }}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
