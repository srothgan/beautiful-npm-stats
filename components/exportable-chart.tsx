"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { Activity } from "lucide-react"
import { formatNumber, formatChartDate } from "@/lib/format"
import type { DailyDownload, VersionRelease } from "@/types/npm"

type Granularity = "daily" | "weekly" | "monthly"

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
  dateRange?: { start: string; end: string }
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
    .map(([key]) => {
      const group = groups.get(key)!
      const date = new Date(key)
      let formattedDate: string
      
      // Sort dates to get start and end
      const sortedDates = group.dates.sort()
      const startDate = sortedDates[0]
      const endDate = sortedDates[sortedDates.length - 1]

      if (granularity === "weekly") {
        formattedDate = formatChartDate(key, includeYear)
      } else {
        formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        })
      }

      return {
        date: key,
        downloads: group.downloads,
        formattedDate,
        dateRange: { start: startDate, end: endDate },
      }
    })
}

interface ExportableChartProps {
  downloads: DailyDownload[]
  versionReleases?: VersionRelease[]
  packageName: string
  title?: string
  granularity?: Granularity
  theme?: "light" | "dark"
  showVersions?: boolean
  releaseFilter?: "major" | "minor" | "all"
}

export const ExportableChart = React.forwardRef<HTMLDivElement, ExportableChartProps>(
  ({ downloads, versionReleases = [], packageName, title = "Downloads Over Time", granularity = "daily", theme = "dark", showVersions = true, releaseFilter = "major" }, ref) => {
    const includeYear = React.useMemo(() => downloads.length > 180, [downloads])

    const chartData = React.useMemo(
      () => aggregateData(downloads, granularity, includeYear),
      [downloads, granularity, includeYear]
    )
    
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

    const tickInterval = React.useMemo(() => {
      const len = chartData.length
      if (len <= 14) return 0
      if (len <= 30) return 2
      if (len <= 60) return 4
      if (len <= 90) return 6
      if (len <= 180) return 14
      return 29
    }, [chartData.length])

    // Theme colors
    const colors = theme === "dark" ? {
      background: 'oklch(0.11 0.01 250)',
      cardBg: 'oklch(0.15 0.01 250 / 0.5)',
      border: 'oklch(0.24 0.01 250 / 0.5)',
      text: 'oklch(0.98 0.01 90)',
      textMuted: 'oklch(0.60 0.01 90)',
      primary: 'oklch(0.78 0.16 75)',
      primaryBg: 'oklch(0.78 0.16 75 / 0.1)',
      gridStroke: 'oklch(0.24 0.01 250 / 0.5)',
    } : {
      background: 'oklch(0.98 0.01 90)',
      cardBg: 'oklch(1 0 0 / 0.5)',
      border: 'oklch(0.85 0.01 90 / 0.5)',
      text: 'oklch(0.15 0.01 250)',
      textMuted: 'oklch(0.50 0.01 250)',
      primary: 'oklch(0.60 0.16 75)',
      primaryBg: 'oklch(0.60 0.16 75 / 0.1)',
      gridStroke: 'oklch(0.85 0.01 90 / 0.5)',
    }

    return (
      <div ref={ref} style={{ width: '1200px', padding: '10px', backgroundColor: colors.background }}>
        <div className="rounded-2xl backdrop-blur-sm overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.cardBg }}>
          {/* Gradient accent top border */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[oklch(0.78_0.16_75/0.5)] to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-3 p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: colors.primaryBg, color: colors.primary }}>
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.text }}>{title}</h3>
              <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
                {packageName} • {chartData.length} data points
              </p>
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
                    <linearGradient id="exportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={colors.gridStroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    stroke={colors.textMuted}
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    tickLine={false}
                    axisLine={false}
                    interval={tickInterval}
                    dy={10}
                  />
                  <YAxis
                    stroke={colors.textMuted}
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                    width={55}
                    dx={-5}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill="url(#exportGradient)"
                    dot={false}
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

          {/* Bottom bar */}
          <div className="px-6 py-3" style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: theme === 'dark' ? 'oklch(0.13 0.01 250 / 0.3)' : 'oklch(0.95 0.01 90 / 0.3)' }}>
            <p className="text-xs font-mono text-center" style={{ color: colors.textMuted }}>
              Generated by <span className="font-semibold" style={{ color: colors.primary }}>beautiful-npm-stats.com</span>
            </p>
          </div>
        </div>
      </div>
    )
  }
)

ExportableChart.displayName = "ExportableChart"
