import { Suspense } from "react"
import { subDays } from "date-fns"
import { GitCompare, Crown } from "lucide-react"
import type { Metadata } from "next"
import { getPackageStats } from "@/lib"
import { getLatestAvailableDate } from "@/lib/chunk-dates"
import { formatISODate, formatNumber } from "@/lib/format"
import { ComparisonChart } from "@/components/comparison-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ComparePageClient, CompareStatsCards } from "./client"
import type { PackageStats } from "@/types/npm"

interface ComparePageProps {
  searchParams: Promise<{
    packages?: string
    start?: string
    end?: string
  }>
}

export const metadata: Metadata = {
  title: "Compare Packages",
  description: "Compare download statistics between npm packages side by side.",
}

function CompareLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <Skeleton className="h-87.5 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-50 w-full rounded-2xl" />
        <Skeleton className="h-50 w-full rounded-2xl" />
      </div>
    </div>
  )
}

async function ComparisonStats({
  packageNames,
  startDate,
  endDate,
}: {
  packageNames: string[]
  startDate: Date
  endDate: Date
}) {
  if (packageNames.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30 mb-6">
          <GitCompare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No packages selected</h3>
        <p className="text-muted-foreground max-w-md">
          Add packages using the search above to compare their download statistics side by side.
        </p>
      </div>
    )
  }

  // Fetch all package stats in parallel
  const statsPromises = packageNames.map(async (name) => {
    try {
      return await getPackageStats(name, startDate, endDate)
    } catch {
      return null
    }
  })

  const results = await Promise.all(statsPromises)
  const validStats = results.filter((s): s is PackageStats => s !== null)

  if (validStats.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
          <GitCompare className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No data found</h3>
        <p className="text-muted-foreground max-w-md">
          Could not fetch statistics for the selected packages.
        </p>
      </div>
    )
  }

  // Sort by total downloads to find winner
  const sorted = [...validStats].sort(
    (a, b) => b.totalDownloads - a.totalDownloads
  )

  return (
    <div className="space-y-6">
      {/* Winner banner */}
      {validStats.length > 1 && (
        <div className="animate-fade-up flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Most downloaded</p>
            <p className="font-semibold">
              <span className="text-primary">{sorted[0].packageName}</span>
              <span className="text-muted-foreground font-normal ml-2">
                with {formatNumber(sorted[0].totalDownloads)} downloads
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Comparison chart */}
      <div className="animate-fade-up stagger-1">
        <ComparisonChart packages={sorted} />
      </div>

      {/* Stats cards grid */}
      <CompareStatsCards stats={sorted} dateRange={{ start: startDate, end: endDate }} />
    </div>
  )
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams
  const packagesParam = params.packages || ""
  const packageNames = packagesParam
    ? packagesParam.split(",").filter(Boolean).slice(0, 4)
    : []

  // Default to last 30 days, ending yesterday (npm data isn't available for today)
  const latestDate = getLatestAvailableDate()
  const endDate = params.end ? new Date(params.end) : latestDate
  const startDate = params.start ? new Date(params.start) : subDays(endDate, 29)

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent/20 to-chart-3/10 border border-accent/20">
            <GitCompare className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Compare Packages
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              side-by-side package analytics
            </p>
          </div>
        </div>
      </div>

      {/* Package selector - client component */}
      <div className="mb-8 animate-fade-up stagger-1">
        <ComparePageClient
          initialPackages={packageNames}
          initialStart={formatISODate(startDate)}
          initialEnd={formatISODate(endDate)}
        />
      </div>

      {/* Comparison stats */}
      <Suspense fallback={<CompareLoadingSkeleton />}>
        <ComparisonStats
          packageNames={packageNames}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  )
}
