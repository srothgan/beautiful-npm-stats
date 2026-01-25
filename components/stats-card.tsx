import {
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  ExternalLink,
  X,
  ArrowRight,
  Package,
  Award,
  FileCode,
  Clock,
} from "lucide-react"
import { formatNumber, formatDateShort, formatGrowthRate, formatRelativeTime, formatISODate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PackageStats, PackageMetadata } from "@/types/npm"
import Link from "next/link"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface StatsCardProps {
  stats: PackageStats
  metadata?: PackageMetadata
  className?: string
  onRemove?: () => void
  dateRange?: { start: Date; end: Date }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StatsCard({ stats, metadata, className, onRemove, dateRange }: StatsCardProps) {
  const isPositiveGrowth = stats.growthRate >= 0

  // Build the detail link URL with date range if provided
  const detailsUrl = dateRange
    ? `/package/${encodeURIComponent(stats.packageName)}?start=${formatISODate(dateRange.start)}&end=${formatISODate(dateRange.end)}`
    : `/package/${encodeURIComponent(stats.packageName)}`

  return (
    <div className={cn("relative group", className)}>
      {/* Main card */}
      <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Gradient accent top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold tracking-tight">
              {stats.packageName}
            </h2>
            <div className="flex items-center gap-1">
              <Link
                href={`https://www.npmjs.com/package/${stats.packageName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 hover:bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-mono">npm</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors md:opacity-0 md:group-hover:opacity-100 hover:cursor-pointer"
                  aria-label={`Remove ${stats.packageName}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {stats.latestVersion && (
              <span className="font-mono">v{stats.latestVersion}</span>
            )}
            {stats.latestVersion && stats.lastUpdated && (
              <span>·</span>
            )}
            {stats.lastUpdated && (
              <span>Updated {formatRelativeTime(stats.lastUpdated)}</span>
            )}
            {metadata?.hasTypeScript && (
              <>
                <span>·</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-blue-500 cursor-help">
                      <FileCode className="h-3 w-3" />
                      <span>TS</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>TypeScript definitions available</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          {/* Package Metadata Row */}
          {metadata && (metadata.npmsScore || metadata.bundleSize || metadata.releaseCadence) && (
            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
              {/* npms.io Score */}
              {metadata.npmsScore && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 cursor-help">
                      <Award className="h-3 w-3 text-yellow-500" />
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-mono font-medium">{metadata.npmsScore.final}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-64">
                    <p className="font-medium mb-1">npms.io Package Score</p>
                    <p className="opacity-80 mb-2">
                      Overall health score based on quality, popularity, and maintenance.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Quality</span>
                        <span className="font-mono">{metadata.npmsScore.quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Popularity</span>
                        <span className="font-mono">{metadata.npmsScore.popularity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance</span>
                        <span className="font-mono">{metadata.npmsScore.maintenance}%</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Bundle Size */}
              {metadata.bundleSize && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 cursor-help">
                      <Package className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-mono font-medium">{formatBytes(metadata.bundleSize.gzip)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-64">
                    <p className="font-medium mb-1">Bundle Size</p>
                    <p className="opacity-80 mb-2">
                      Size added to your bundle when importing this package.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Minified</span>
                        <span className="font-mono">{formatBytes(metadata.bundleSize.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gzipped</span>
                        <span className="font-mono">{formatBytes(metadata.bundleSize.gzip)}</span>
                      </div>
                      {metadata.bundleSize.hasJSModule && (
                        <div className="text-green-500 mt-1">✓ ES Module (tree-shakable)</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Release Cadence */}
              {metadata.releaseCadence && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 cursor-help">
                      <Clock className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Releases</span>
                      <span className="font-mono font-medium">~{metadata.releaseCadence.averageDaysBetweenReleases}d</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-64">
                    <p className="font-medium mb-1">Release Cadence</p>
                    <p className="opacity-80 mb-2">
                      How frequently this package publishes new versions.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Avg. between releases</span>
                        <span className="font-mono">{metadata.releaseCadence.averageDaysBetweenReleases} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total releases</span>
                        <span className="font-mono">{metadata.releaseCadence.totalReleases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last release</span>
                        <span className="font-mono">{metadata.releaseCadence.lastReleaseDate}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Stats quadrant grid - 2x2 */}
        <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
          {/* Total Downloads */}
          <div className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Total</span>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight">
              {formatNumber(stats.totalDownloads)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {stats.downloads.length} days
            </p>
          </div>

          {/* Daily Average */}
          <div className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>Daily Avg</span>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight">
              {formatNumber(stats.dailyAverage)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              per day
            </p>
          </div>

          {/* Peak Day */}
          <div className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-chart-3" />
              <span>Peak</span>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight">
              {formatNumber(stats.peakDay.downloads)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {formatDateShort(stats.peakDay.date)}
            </p>
          </div>

          {/* Growth Rate */}
          <div className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              {isPositiveGrowth ? (
                <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span>Growth</span>
            </div>
            <p
              className={cn(
                "text-2xl font-bold font-mono tracking-tight",
                isPositiveGrowth ? "text-chart-4" : "text-destructive"
              )}
            >
              {formatGrowthRate(stats.growthRate)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              vs previous
            </p>
          </div>
        </div>

        {/* Details Link - Auto-show when dateRange is provided (compare context) */}
        {dateRange && (
          <div className="border-t border-border/50">
            <Link
              href={detailsUrl}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
