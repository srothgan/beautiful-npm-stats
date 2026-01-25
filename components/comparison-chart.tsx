"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { GitCompare, ChevronLeft, ChevronRight } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CHART_COLORS } from "@/lib/constants"
import type { PackageStats } from "@/types/npm"

type Granularity = "daily" | "weekly" | "monthly"

interface ComparisonChartProps {
  packages: PackageStats[]
  className?: string
}

interface ChartDataPoint {
  date: string
  label: string
  [key: string]: number | string
}

function getDefaultGranularity(dataLength: number): Granularity {
  if (dataLength > 365) return "weekly"
  return "daily"
}

function getAvailableGranularities(dataLength: number): Granularity[] {
  const available: Granularity[] = ["daily"]
  if (dataLength >= 14) available.push("weekly")
  if (dataLength >= 60) available.push("monthly")
  return available
}

function aggregateComparisonData(
  packages: PackageStats[],
  granularity: Granularity,
  includeYear: boolean
): ChartDataPoint[] {
  if (packages.length === 0) return []

  // First, create a map of all dates with all package data
  const dateMap = new Map<string, { [key: string]: number }>()

  packages.forEach((pkg) => {
    pkg.downloads.forEach((d) => {
      if (!dateMap.has(d.day)) {
        dateMap.set(d.day, {})
      }
      const point = dateMap.get(d.day)!
      point[pkg.packageName] = d.downloads
    })
  })

  // Sort dates
  const sortedDates = Array.from(dateMap.keys()).sort()

  if (granularity === "daily") {
    return sortedDates.map((day) => {
      const data = dateMap.get(day)!
      const d = new Date(day)
      const dayNum = d.getDate()
      const month = d.toLocaleDateString("en-US", { month: "short" })
      const formattedDate = includeYear
        ? `${dayNum} ${month} ${d.getFullYear().toString().slice(-2)}`
        : `${dayNum} ${month}`

      return {
        date: day,
        label: formatDate(day),
        formattedDate,
        ...data,
      }
    })
  }

  // Aggregate by week or month
  const groups = new Map<string, { dates: string[]; data: { [key: string]: number } }>()

  sortedDates.forEach((day) => {
    const date = new Date(day)
    let key: string

    if (granularity === "weekly") {
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      key = monday.toISOString().split("T")[0]
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
    }

    const dayData = dateMap.get(day)!
    const existing = groups.get(key)

    if (existing) {
      existing.dates.push(day)
      Object.entries(dayData).forEach(([pkg, downloads]) => {
        existing.data[pkg] = (existing.data[pkg] || 0) + downloads
      })
    } else {
      groups.set(key, {
        dates: [day],
        data: { ...dayData },
      })
    }
  })

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const date = new Date(key)
      let formattedDate: string
      let label: string

      if (granularity === "weekly") {
        const dayNum = date.getDate()
        const month = date.toLocaleDateString("en-US", { month: "short" })
        formattedDate = includeYear
          ? `${dayNum} ${month} ${date.getFullYear().toString().slice(-2)}`
          : `${dayNum} ${month}`
        const endDate = value.dates[value.dates.length - 1]
        label = `Week of ${formatDate(key)} - ${formatDate(endDate)}`
      } else {
        formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        })
        label = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      }

      return {
        date: key,
        formattedDate,
        label,
        ...value.data,
      }
    })
}

export function ComparisonChart({ packages, className }: ComparisonChartProps) {
  const dataLength = packages[0]?.downloads.length || 0
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const [granularity, setGranularity] = React.useState<Granularity>(() =>
    getDefaultGranularity(dataLength)
  )

  // Reset granularity when data changes significantly
  React.useEffect(() => {
    const defaultGran = getDefaultGranularity(dataLength)
    const available = getAvailableGranularities(dataLength)
    if (!available.includes(granularity)) {
      setGranularity(defaultGran)
    }
  }, [dataLength, granularity])

  const availableGranularities = React.useMemo(
    () => getAvailableGranularities(dataLength),
    [dataLength]
  )

  // Include year when data is more than 6 months
  const includeYear = dataLength > 180

  const chartData = React.useMemo(
    () => aggregateComparisonData(packages, granularity, includeYear),
    [packages, granularity, includeYear]
  )

  // Calculate appropriate tick count based on data length
  // Show fewer ticks to prevent overlap on smaller screens
  const tickInterval = React.useMemo(() => {
    const len = chartData.length
    if (len <= 7) return 0 // Show all ticks for a week
    if (len <= 14) return 1 // Every other day for 2 weeks
    if (len <= 30) return 4 // ~6 ticks for a month
    if (len <= 60) return 9 // ~6 ticks for 2 months
    if (len <= 90) return 14 // ~6 ticks for 3 months
    if (len <= 180) return 29 // ~6 ticks for 6 months
    return 59 // ~6 ticks for a year
  }, [chartData.length])

  const granularityLabels: Record<Granularity, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  }

  // Check scroll state
  const updateScrollState = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }, [])

  React.useEffect(() => {
    updateScrollState()
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateScrollState)
      window.addEventListener('resize', updateScrollState)
      return () => {
        scrollEl.removeEventListener('scroll', updateScrollState)
        window.removeEventListener('resize', updateScrollState)
      }
    }
  }, [updateScrollState, chartData])

  const scrollLeftFn = () => {
    if (scrollRef.current) {
      const newScrollLeft = Math.max(0, scrollRef.current.scrollLeft - 150)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  const scrollRightFn = () => {
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      const newScrollLeft = Math.min(maxScroll, scrollRef.current.scrollLeft + 150)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  if (packages.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Gradient accent top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Downloads Comparison</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {packages.length} packages · {chartData.length} data points
              </p>
            </div>
          </div>

          {/* Granularity buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50 w-fit">
            {availableGranularities.map((gran) => (
              <button
                key={gran}
                onClick={() => setGranularity(gran)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                  granularity === gran
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {granularityLabels[gran]}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 sm:gap-4 px-4 sm:px-6 py-3 border-b border-border/50 bg-muted/20">
          {packages.map((pkg, index) => (
            <div key={pkg.packageName} className="flex items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-sm font-medium truncate max-w-32 sm:max-w-none">{pkg.packageName}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {formatNumber(pkg.totalDownloads)}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative">
          <div ref={scrollRef} className="p-4 sm:p-6 pt-4 overflow-x-auto scrollbar-none">
            <div className="h-80 sm:h-87.5 min-w-125">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="oklch(0.24 0.01 250 / 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="oklch(0.60 0.01 90)"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval}
                  dy={5}
                  tick={{ fontSize: 10 }}
                  height={40}
                  tickFormatter={(value) => {
                    const d = new Date(value)
                    const day = d.getDate()
                    const month = d.toLocaleDateString("en-US", { month: "short" })
                    if (includeYear) {
                      const year = d.getFullYear().toString().slice(-2)
                      return `${day} ${month} ${year}`
                    }
                    return `${day} ${month}`
                  }}
                />
                <YAxis
                  stroke="oklch(0.60 0.01 90)"
                  fontSize={11}
                  fontFamily="JetBrains Mono, monospace"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                  width={55}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartDataPoint
                      return (
                        <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-4 shadow-xl min-w-40">
                          <p className="text-xs font-mono text-muted-foreground mb-3">
                            {data.label}
                          </p>
                          <div className="space-y-2">
                            {payload.map((entry) => (
                              <div
                                key={entry.name}
                                className="flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm font-medium">
                                    {entry.name}
                                  </span>
                                </div>
                                <span className="text-sm font-mono font-bold">
                                  {formatNumber(entry.value as number)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {packages.map((pkg, index) => (
                  <Line
                    key={pkg.packageName}
                    type="monotone"
                    dataKey={pkg.packageName}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: CHART_COLORS[index % CHART_COLORS.length],
                      stroke: "oklch(0.11 0.01 250)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Scroll buttons - mobile only, at bottom */}
          {(canScrollLeft || canScrollRight) && (
            <div className="flex items-center justify-center gap-2 py-2 sm:hidden">
              <button
                onClick={scrollLeftFn}
                disabled={!canScrollLeft}
                className="flex items-center justify-center h-8 px-3 rounded-md bg-muted/90 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollRightFn}
                disabled={!canScrollRight}
                className="flex items-center justify-center h-8 px-3 rounded-md bg-muted/90 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
