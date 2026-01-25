"use client"

import { parseAsIsoDate, useQueryStates } from "nuqs"
import { Package, Share2, Check, GitCompare } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { DateRangePicker } from "@/components/date-range-picker"
import { cn } from "@/lib/utils"
import { formatISODate } from "@/lib/format"

interface PackagePageClientProps {
  packageName: string
  initialStart: string
  initialEnd: string
}

export function PackagePageClient({
  packageName,
  initialStart,
  initialEnd,
}: PackagePageClientProps) {
  const [copied, setCopied] = useState(false)

  const [{ start, end }, setDates] = useQueryStates(
    {
      start: parseAsIsoDate.withDefault(new Date(initialStart)),
      end: parseAsIsoDate.withDefault(new Date(initialEnd)),
    },
    {
      shallow: false, // Trigger server re-render
    }
  )

  const handleRangeChange = (newStart: Date, newEnd: Date) => {
    setDates({ start: newStart, end: newEnd })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent/10 border border-primary/20">
          <Package className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {packageName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            npm package analytics
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <DateRangePicker
          startDate={start}
          endDate={end}
          onRangeChange={handleRangeChange}
        />

        <div className="flex items-center gap-2">
          <Link
            href={`/compare?packages=${encodeURIComponent(packageName)}&start=${formatISODate(start)}&end=${formatISODate(end)}`}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-lg",
              "border border-border/50 bg-muted/30",
              "text-sm font-medium text-muted-foreground",
              "hover:border-accent/30 hover:text-foreground",
              "transition-all duration-200"
            )}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>Compare</span>
          </Link>

          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-lg",
              "border border-border/50 bg-muted/30",
              "text-sm font-medium text-muted-foreground",
              "hover:border-primary/30 hover:text-foreground",
              "transition-all duration-200",
              copied && "border-chart-4/50 text-chart-4"
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
