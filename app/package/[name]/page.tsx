import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Terminal } from "lucide-react"
import { subDays } from "date-fns"
import type { Metadata } from "next"
import { getPackageStats, fetchPackageInfo, parseGitHubRepo, fetchGitHubData, getDependencyTree, getPackageMetadata } from "@/lib"
import { getLatestAvailableDate } from "@/lib/chunk-dates"
import { formatISODate } from "@/lib/format"
import { StatsCard } from "@/components/stats-card"
import { DownloadChart } from "@/components/download-chart"
import { VersionStats } from "@/components/version-stats"
import { GitHubInfo } from "@/components/github-info"
import { Maintainers, Contributors } from "@/components/maintainers-contributors"
import { DependencyGraph } from "@/components/dependency-graph"
import { Skeleton } from "@/components/ui/skeleton"
import { PackagePageClient } from "./client"

interface PackagePageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { name } = await params
  const packageName = decodeURIComponent(name)

  return {
    title: `${packageName} - Download Statistics`,
    description: `View download statistics, trends, and analytics for the ${packageName} npm package.`,
    openGraph: {
      title: `${packageName} - npm Download Statistics`,
      description: `View download statistics, trends, and analytics for the ${packageName} npm package.`,
    },
  }
}

function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}

async function PackageStats({
  packageName,
  startDate,
  endDate,
}: {
  packageName: string
  startDate: Date
  endDate: Date
}) {
  const [stats, packageInfo, dependencyTree, metadata] = await Promise.all([
    getPackageStats(packageName, startDate, endDate).catch((error) => {
      if (error instanceof Error && error.message.includes("not found")) {
        notFound()
      }
      throw error
    }),
    fetchPackageInfo(packageName),
    getDependencyTree(packageName).catch(() => null),
    getPackageMetadata(packageName).catch(() => null),
  ])

  // Fetch GitHub data if repository exists
  const githubRepo = packageInfo ? parseGitHubRepo(packageInfo) : null
  const githubData = githubRepo 
    ? await fetchGitHubData(githubRepo.owner, githubRepo.repo)
    : null

  return (
    <div className="space-y-6">
      <div className="animate-fade-up stagger-1">
        <StatsCard stats={stats} metadata={metadata || undefined} />
      </div>
      
      {/* GitHub Info */}
      {githubRepo && githubData && (
        <div className="animate-fade-up stagger-2">
          <GitHubInfo githubData={githubData} githubRepo={githubRepo} />
        </div>
      )}
      
      <div className="animate-fade-up stagger-3">
        <DownloadChart 
          downloads={stats.downloads} 
          versionReleases={stats.versionReleases}
          packageName={packageName} 
        />
      </div>
      
      {stats.versionDownloads && stats.versionDownloads.length > 0 && (
        <div className="animate-fade-up stagger-4">
          <VersionStats 
            versions={stats.versionDownloads} 
            latestVersion={stats.latestVersion}
          />
        </div>
      )}

      {/* Dependency Graph */}
      {dependencyTree && (
        <div className="animate-fade-up stagger-5">
          <DependencyGraph 
            dependencyTree={dependencyTree} 
            packageName={packageName} 
          />
        </div>
      )}
      
      {/* Maintainers and Contributors Grid */}
      {packageInfo && (githubData?.contributors || packageInfo.maintainers) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up stagger-6">
          {packageInfo.maintainers && packageInfo.maintainers.length > 0 && (
            <Maintainers maintainers={packageInfo.maintainers} />
          )}
          {githubData?.contributors && githubData.contributors.length > 0 && (
            <Contributors contributors={githubData.contributors} />
          )}
        </div>
      )}
    </div>
  )
}

export default async function PackagePage({
  params,
  searchParams,
}: PackagePageProps) {
  const { name } = await params
  const { start, end } = await searchParams
  const packageName = decodeURIComponent(name)

  // Default to last 30 days, ending yesterday (npm data isn't available for today)
  const latestDate = getLatestAvailableDate()
  const endDate = end ? new Date(end) : latestDate
  const startDate = start ? new Date(start) : subDays(endDate, 29)

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm animate-fade-in">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-mono">home</span>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        <span className="font-mono font-medium text-primary">{packageName}</span>
      </nav>

      {/* Header with date picker */}
      <div className="mb-8 animate-fade-up">
        <PackagePageClient
          packageName={packageName}
          initialStart={formatISODate(startDate)}
          initialEnd={formatISODate(endDate)}
        />
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <PackageStats
          packageName={packageName}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  )
}
