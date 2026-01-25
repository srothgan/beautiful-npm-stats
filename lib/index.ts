import { unstable_cache } from "next/cache"
import { getPreviousPeriod } from "./chunk-dates"
import { formatISODate } from "./format"

// Internal imports for cached functions
import { fetchPackageDownloads, fetchPackageInfo, fetchVersionDownloads, fetchDependencyTree, checkTypeScriptSupport } from "./api/npm-registry"
import { fetchNpmsScore } from "./api/npms-score"
import { fetchBundleSize } from "./api/bundlephobia"
import { extractVersionReleases, calculateReleaseCadence } from "./utils/version"
import { calculateStats } from "./utils/stats"

// Types
import type { PackageStats, DailyDownload, PackageMetadata } from "@/types/npm"

// Re-export all API functions
export {
  fetchPackageDownloads,
  fetchPackageInfo,
  searchPackages,
  fetchVersionDownloads,
  fetchDependencyTree,
  checkTypeScriptSupport,
} from "./api/npm-registry"

export { parseGitHubRepo, fetchGitHubData } from "./api/github"
export { fetchNpmsScore } from "./api/npms-score"
export { fetchBundleSize } from "./api/bundlephobia"

// Re-export utils
export { parseVersionType, extractVersionReleases, calculateReleaseCadence } from "./utils/version"
export { calculateStats } from "./utils/stats"

/**
 * Get complete package stats including growth comparison
 */
export const getPackageStats = unstable_cache(
  async (
    packageName: string,
    startDate: Date,
    endDate: Date
  ): Promise<PackageStats> => {
    // Fetch current period downloads and version downloads in parallel
    const [downloads, versionDownloads, packageInfo] = await Promise.all([
      fetchPackageDownloads(packageName, startDate, endDate),
      fetchVersionDownloads(packageName).catch(() => []),
      fetchPackageInfo(packageName),
    ])

    // Fetch previous period for growth calculation
    const previousPeriod = getPreviousPeriod(startDate, endDate)
    let previousDownloads: DailyDownload[] = []

    try {
      previousDownloads = await fetchPackageDownloads(
        packageName,
        previousPeriod.start,
        previousPeriod.end
      )
    } catch {
      // Previous period might not have data, that's okay
    }

    // Extract version releases within the date range
    const versionReleases = packageInfo
      ? extractVersionReleases(packageInfo, startDate, endDate)
      : []

    const stats = calculateStats(downloads, previousDownloads)

    return {
      packageName,
      startDate: formatISODate(startDate),
      endDate: formatISODate(endDate),
      downloads,
      ...stats,
      latestVersion: packageInfo?.["dist-tags"]?.latest,
      lastUpdated: packageInfo?.time?.modified,
      versionDownloads: versionDownloads.slice(0, 10), // Top 10 versions
      versionReleases,
    }
  },
  ["package-stats"],
  { revalidate: 3600 } // Cache for 1 hour
)

/**
 * Cached version of fetchDependencyTree
 */
export const getDependencyTree = unstable_cache(
  async (packageName: string) => {
    return fetchDependencyTree(packageName, 3)
  },
  ["dependency-tree"],
  { revalidate: 86400 } // Cache for 24 hours
)

/**
 * Fetch all package metadata (npms score, bundle size, typescript, release cadence)
 */
export const getPackageMetadata = unstable_cache(
  async (packageName: string): Promise<PackageMetadata> => {
    const [npmsScore, bundleSize, hasTypeScript, packageInfo] = await Promise.all([
      fetchNpmsScore(packageName),
      fetchBundleSize(packageName),
      checkTypeScriptSupport(packageName),
      fetchPackageInfo(packageName),
    ])

    const releaseCadence = packageInfo ? calculateReleaseCadence(packageInfo) : null

    return {
      npmsScore: npmsScore || undefined,
      bundleSize: bundleSize || undefined,
      hasTypeScript,
      releaseCadence: releaseCadence || undefined,
    }
  },
  ["package-metadata"],
  { revalidate: 3600 } // Cache for 1 hour
)
