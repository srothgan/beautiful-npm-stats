"use client"

import * as React from "react"
import { Layers, TrendingUp, ArrowUpDown } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { VersionDownload } from "@/types/npm"

interface VersionStatsProps {
  versions: VersionDownload[]
  latestVersion?: string
  className?: string
}

type SortBy = "downloads" | "version"

// Simple semver comparison
function compareSemver(a: string, b: string): number {
  const parseVersion = (v: string) => {
    const match = v.match(/^(\d+)\.(\d+)\.(\d+)/)
    if (!match) return [0, 0, 0]
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
  }
  
  const [aMajor, aMinor, aPatch] = parseVersion(a)
  const [bMajor, bMinor, bPatch] = parseVersion(b)
  
  if (aMajor !== bMajor) return bMajor - aMajor
  if (aMinor !== bMinor) return bMinor - aMinor
  return bPatch - aPatch
}

export function VersionStats({ versions, latestVersion, className }: VersionStatsProps) {
  const [sortBy, setSortBy] = React.useState<SortBy>("downloads")

  const sortedVersions = React.useMemo(() => {
    if (!versions || versions.length === 0) return []
    
    const copy = [...versions]
    if (sortBy === "downloads") {
      return copy.sort((a, b) => b.downloads - a.downloads)
    } else {
      return copy.sort((a, b) => compareSemver(a.version, b.version))
    }
  }, [versions, sortBy])

  if (!versions || versions.length === 0) {
    return null
  }

  const topVersion = sortedVersions[0]
  const topVersionIsLatest = topVersion.version === latestVersion

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Gradient accent top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Version Downloads</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Last 7 days
            </p>
          </div>
        </div>
        
        {/* Sort controls */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 bg-muted/30 w-fit">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
          {(["downloads", "version"] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-all duration-200",
                sortBy === sort
                  ? "bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {sort === "downloads" ? "popular" : "version"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Version Highlight */}
      {sortBy === "downloads" && (
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Most Downloaded</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg">v{topVersion.version}</span>
                  {topVersionIsLatest && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-chart-4/20 text-chart-4">
                      LATEST
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-lg">{formatNumber(topVersion.downloads)}</p>
              <p className="text-xs text-muted-foreground">{topVersion.percentage.toFixed(1)}% of total</p>
            </div>
          </div>
        </div>
      )}

      {/* Version List */}
      <div className="p-4">
        <div className="space-y-3">
          {sortedVersions.slice(0, 8).map((version, index) => {
            const isLatest = version.version === latestVersion
            const maxPercentage = sortedVersions[0].percentage
            return (
              <div key={version.version} className="group">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-4">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm truncate">
                        v{version.version}
                      </span>
                      {isLatest && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-chart-4/20 text-chart-4 shrink-0">
                          LATEST
                        </span>
                      )}
                    </div>
                    {/* Progress bar - only show when sorting by downloads */}
                    {sortBy === "downloads" && (
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            index === 0 ? "bg-primary" : "bg-primary/50"
                          )}
                          style={{ width: `${Math.max((version.percentage / maxPercentage) * 100, 0.5)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm">{formatNumber(version.downloads)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {version.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
