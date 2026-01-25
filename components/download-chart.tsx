"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { Activity, Download, Tag } from "lucide-react"
import { toPng } from "html-to-image"
import { useTheme } from "next-themes"
import { formatNumber, formatChartDate, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DailyDownload, VersionRelease } from "@/types/npm"
import { ExportableChart } from "./exportable-chart"

type Granularity = "daily" | "weekly" | "monthly"

interface DownloadChartProps {
  downloads: DailyDownload[]
  versionReleases?: VersionRelease[]
  title?: string
  className?: string
  packageName?: string
}

// Custom label component for version release markers
interface VersionLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number }
  value?: string
  fill?: string
}

const VersionLabel: React.FC<VersionLabelProps> = ({ viewBox, value, fill }) => {
  if (!viewBox || !value) return null

  const { x, y } = viewBox
  const padding = 4
  const textWidth = value.length * 6 // Approximate width
  const boxWidth = textWidth + padding * 2
  const boxHeight = 16

  return (
    <g>
      {/* Background rectangle with slight rounding */}
      <rect
        x={x - boxWidth / 2}
        y={y + 15}
        width={boxWidth}
        height={boxHeight}
        fill="oklch(0.98 0.01 90)"
        stroke={fill}
        strokeWidth={1}
        rx={3}
        ry={3}
        opacity={0.95}
      />
      {/* Text */}
      <text
        x={x}
        y={y + 15 + boxHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fill}
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={500}
      >
        {value}
      </text>
    </g>
  )
}

interface ChartDataPoint {
  date: string
  downloads: number
  formattedDate: string
  label: string
  dateRange?: { start: string; end: string } // For weekly/monthly aggregation
}

function aggregateData(
  downloads: DailyDownload[],
  granularity: Granularity,
  includeYear: boolean
): ChartDataPoint[] {
  if (granularity === "daily") {
    return downloads.map((d) => ({
      date: d.day,
      downloads: d.downloads,
      formattedDate: formatChartDate(d.day, includeYear),
      label: formatDate(d.day),
      dateRange: { start: d.day, end: d.day },
    }))
  }

  const groups: Map<string, { downloads: number; dates: string[] }> = new Map()

  downloads.forEach((d) => {
    const date = new Date(d.day)
    let key: string

    if (granularity === "weekly") {
      // Get the Monday of the week
      const dayOfWeek = date.getDay()
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(date.setDate(diff))
      key = monday.toISOString().split("T")[0]
    } else {
      // Monthly - use first day of month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
    }

    const existing = groups.get(key)
    if (existing) {
      existing.downloads += d.downloads
      existing.dates.push(d.day)
    } else {
      groups.set(key, { downloads: d.downloads, dates: [d.day] })
    }
  })

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const date = new Date(key)
      let formattedDate: string
      let label: string

      // Sort dates to get start and end
      const sortedDates = value.dates.sort()
      const startDate = sortedDates[0]
      const endDate = sortedDates[sortedDates.length - 1]

      if (granularity === "weekly") {
        formattedDate = formatChartDate(key, includeYear)
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
        downloads: value.downloads,
        formattedDate,
        label,
        dateRange: { start: startDate, end: endDate },
      }
    })
}

function getDefaultGranularity(dataLength: number): Granularity {
  if (dataLength > 365) return "weekly"
  if (dataLength > 90) return "daily"
  return "daily"
}

function getAvailableGranularities(dataLength: number): Granularity[] {
  const available: Granularity[] = ["daily"]
  if (dataLength >= 14) available.push("weekly")
  if (dataLength >= 60) available.push("monthly")
  return available
}

export function DownloadChart({
  downloads,
  versionReleases = [],
  title = "Downloads Over Time",
  className,
  packageName = "package",
}: DownloadChartProps) {
  const [granularity, setGranularity] = React.useState<Granularity>(() =>
    getDefaultGranularity(downloads.length)
  )
  const [showVersions, setShowVersions] = React.useState(true)
  const [releaseFilter, setReleaseFilter] = React.useState<"major" | "minor" | "all">("major")
  const [isExporting, setIsExporting] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const exportRef = React.useRef<HTMLDivElement>(null)
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme

  // Only render ExportableChart on client to avoid hydration mismatch
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Filter releases based on user selection
  const filteredReleases = React.useMemo(() => {
    if (releaseFilter === "major") {
      return versionReleases.filter((r) => r.isMajor)
    } else if (releaseFilter === "minor") {
      return versionReleases.filter((r) => r.isMajor || r.isMinor)
    }
    // "all" includes major, minor, and patch
    return versionReleases
  }, [versionReleases, releaseFilter])

  // Reset granularity when data changes significantly
  React.useEffect(() => {
    const defaultGran = getDefaultGranularity(downloads.length)
    const available = getAvailableGranularities(downloads.length)
    if (!available.includes(granularity)) {
      setGranularity(defaultGran)
    }
  }, [downloads.length, granularity])

  const availableGranularities = React.useMemo(
    () => getAvailableGranularities(downloads.length),
    [downloads.length]
  )

  // Include year in axis labels when data is more than 6 months (180 days)
  const includeYear = React.useMemo(() => {
    return downloads.length > 180
  }, [downloads])

  const chartData = React.useMemo(
    () => aggregateData(downloads, granularity, includeYear),
    [downloads, granularity, includeYear]
  )

  // Calculate appropriate tick count based on data length
  const tickInterval = React.useMemo(() => {
    const len = chartData.length
    if (len <= 14) return 0
    if (len <= 30) return 2
    if (len <= 60) return 4
    if (len <= 90) return 6
    if (len <= 180) return 14
    return 29
  }, [chartData.length])

  const granularityLabels: Record<Granularity, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  }

  const handleExport = async () => {
    if (!exportRef.current) return

    setIsExporting(true)
    try {
      // Wait for next frame to ensure the component is rendered
      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: currentTheme === 'dark' ? '#1c1917' : '#fafaf9',
      })

      // Download the image
      const link = document.createElement('a')
      link.download = `${packageName}-stats.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to export chart:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={className}>
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Gradient accent top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {chartData.length} data points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version toggle and filter */}
            {versionReleases.length > 0 && (
              <>
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                    "border border-border/50",
                    showVersions
                      ? "bg-accent/20 border-accent/30 text-accent"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border"
                  )}
                >
                  <Tag className="h-3.5 w-3.5" />
                  Versions
                </button>

                {showVersions && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 bg-muted/30">
                    {["major", "minor", "all"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setReleaseFilter(filter as typeof releaseFilter)}
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded transition-all duration-200",
                          releaseFilter === filter
                            ? "bg-accent/20 text-accent"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                "bg-muted/30 border border-border/50 text-muted-foreground",
                "hover:bg-muted/50 hover:text-foreground hover:border-border",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? "Exporting..." : "Export PNG"}
            </button>

            {/* Granularity buttons */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
              {availableGranularities.map((gran) => (
                <button
                  key={gran}
                  onClick={() => setGranularity(gran)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                    granularity === gran
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {granularityLabels[gran]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6 pt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="oklch(0.24 0.01 250 / 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="formattedDate"
                  stroke="oklch(0.60 0.01 90)"
                  fontSize={11}
                  fontFamily="JetBrains Mono, monospace"
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval}
                  dy={10}
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
                        <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl">
                          <p className="text-xs font-mono text-muted-foreground mb-1">
                            {data.label}
                          </p>
                          <p className="text-lg font-bold font-mono text-primary">
                            {formatNumber(data.downloads)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {granularity === "daily" ? "downloads" : "total downloads"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="oklch(0.78 0.16 75)"
                  strokeWidth={2}
                  fill="url(#downloadGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "oklch(0.78 0.16 75)",
                    stroke: "oklch(0.11 0.01 250)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
                {/* Version release markers */}
                {showVersions &&
                  filteredReleases.map((release) => {
                    // Find the data point where the release date falls within the date range
                    const dataIndex = chartData.findIndex((d) => {
                      if (!d.dateRange) return false
                      return release.date >= d.dateRange.start && release.date <= d.dateRange.end
                    })
                    if (dataIndex === -1) return null

                    // Determine color based on release type
                    const color = release.isMajor
                      ? "oklch(0.65 0.2 25)" // orange for major
                      : release.isMinor
                      ? "oklch(0.65 0.15 250)" // blue for minor
                      : "oklch(0.65 0.1 150)" // green for patch

                    return (
                      <ReferenceLine
                        key={release.version}
                        x={chartData[dataIndex].formattedDate}
                        stroke={color}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={<VersionLabel value={`v${release.version}`} fill={color} />}
                      />
                    )
                  })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hidden exportable chart for image generation - only render on client */}
      {isMounted && (
        <div className="fixed -left-2499.75 -top-2499.75 pointer-events-none">
          <ExportableChart
            ref={exportRef}
            downloads={downloads}
            versionReleases={versionReleases}
            packageName={packageName}
            title={title}
            granularity={granularity}
            theme={currentTheme as "light" | "dark"}
            showVersions={showVersions}
            releaseFilter={releaseFilter}
          />
        </div>
      )}
    </div>
  )
}
