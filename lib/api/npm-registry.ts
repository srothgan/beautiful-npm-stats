import {
  NPM_DOWNLOADS_API,
  NPM_REGISTRY_API,
  NPM_SEARCH_API,
} from "../constants"
import { chunkDateRange } from "../chunk-dates"
import { formatISODate } from "../format"
import type {
  NpmDownloadsResponse,
  NpmPackageInfo,
  NpmSearchResult,
  DailyDownload,
  NpmVersionDownloadsResponse,
  VersionDownload,
  DependencyNode,
  DependencyTreeResult,
} from "@/types/npm"

/**
 * Fetch download stats for a package within a date range
 * Handles chunking for large date ranges
 */
export async function fetchPackageDownloads(
  packageName: string,
  startDate: Date,
  endDate: Date
): Promise<DailyDownload[]> {
  const chunks = chunkDateRange(startDate, endDate)
  const allDownloads: DailyDownload[] = []

  for (const chunk of chunks) {
    const start = formatISODate(chunk.start)
    const end = formatISODate(chunk.end)
    const url = `${NPM_DOWNLOADS_API}/${start}:${end}/${encodeURIComponent(packageName)}`

    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Package "${packageName}" not found`)
      }
      throw new Error(`Failed to fetch downloads: ${response.statusText}`)
    }

    const data: NpmDownloadsResponse = await response.json()
    allDownloads.push(...data.downloads)
  }

  return allDownloads
}

/**
 * Fetch package info from npm registry
 */
export async function fetchPackageInfo(
  packageName: string
): Promise<NpmPackageInfo | null> {
  const url = `${NPM_REGISTRY_API}/${encodeURIComponent(packageName)}`

  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch package info: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Search for packages on npm
 */
export async function searchPackages(
  query: string,
  size: number = 10
): Promise<NpmSearchResult> {
  const url = `${NPM_SEARCH_API}?text=${encodeURIComponent(query)}&size=${size}`

  const response = await fetch(url, { next: { revalidate: 300 } }) // Cache for 5 minutes

  if (!response.ok) {
    throw new Error(`Failed to search packages: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch version-specific download counts (last week)
 */
export async function fetchVersionDownloads(
  packageName: string
): Promise<VersionDownload[]> {
  const url = `https://api.npmjs.org/versions/${encodeURIComponent(packageName)}/last-week`

  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch version downloads: ${response.statusText}`)
  }

  const data: NpmVersionDownloadsResponse = await response.json()
  
  // Convert to array and calculate percentages
  const entries = Object.entries(data.downloads)
  const totalDownloads = entries.reduce((sum, [, count]) => sum + count, 0)
  
  const versionDownloads: VersionDownload[] = entries
    .map(([version, downloads]) => ({
      version,
      downloads,
      percentage: totalDownloads > 0 ? (downloads / totalDownloads) * 100 : 0,
    }))
    .sort((a, b) => b.downloads - a.downloads) // Sort by downloads descending
  
  return versionDownloads
}

/**
 * Fetch the latest version info for a package (includes dependencies)
 */
export async function fetchLatestPackageVersion(
  packageName: string
): Promise<{ version: string; dependencies: Record<string, string> } | null> {
  const url = `${NPM_REGISTRY_API}/${encodeURIComponent(packageName)}/latest`

  const response = await fetch(url, { next: { revalidate: 3600 } })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return {
    version: data.version || "unknown",
    dependencies: data.dependencies || {},
  }
}

/**
 * Fetch dependency tree for a package up to a specified depth (max 3)
 * Fetches all dependencies at each level in parallel for performance
 */
export async function fetchDependencyTree(
  packageName: string,
  maxDepth: number = 3
): Promise<DependencyTreeResult | null> {
  const visited = new Set<string>()
  let totalDependencies = 0

  async function fetchNode(
    name: string,
    currentDepth: number
  ): Promise<DependencyNode | null> {
    if (currentDepth > maxDepth || visited.has(name)) {
      return null
    }
    visited.add(name)

    try {
      const info = await fetchLatestPackageVersion(name)
      if (!info) {
        return null
      }

      const { version, dependencies: deps } = info
      const depNames = Object.keys(deps)

      totalDependencies += depNames.length

      // If we haven't reached max depth, fetch children in parallel
      let children: DependencyNode[] = []
      if (currentDepth < maxDepth && depNames.length > 0) {
        const childPromises = depNames.map((depName) =>
          fetchNode(depName, currentDepth + 1)
        )
        const results = await Promise.all(childPromises)
        children = results.filter((node): node is DependencyNode => node !== null)
      } else if (depNames.length > 0) {
        // At max depth, just show dependency names without fetching further
        children = depNames.map((depName) => ({
          name: depName,
          version: deps[depName] || "unknown",
        }))
      }

      return {
        name,
        version,
        dependencies: children.length > 0 ? children : undefined,
      }
    } catch {
      return null
    }
  }

  const root = await fetchNode(packageName, 1)
  if (!root) return null

  return {
    root,
    totalDependencies,
    maxDepth,
  }
}

/**
 * Check if package has TypeScript support
 */
export async function checkTypeScriptSupport(packageName: string): Promise<boolean> {
  try {
    // First check if the package itself has types
    const url = `${NPM_REGISTRY_API}/${encodeURIComponent(packageName)}/latest`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (response.ok) {
      const data = await response.json()
      // Check for types or typings field
      if (data.types || data.typings) {
        return true
      }
    }

    // Check for @types package
    const typesPackage = packageName.startsWith("@")
      ? `@types/${packageName.slice(1).replace("/", "__")}`
      : `@types/${packageName}`

    const typesUrl = `${NPM_REGISTRY_API}/${encodeURIComponent(typesPackage)}`
    const typesResponse = await fetch(typesUrl, { next: { revalidate: 3600 } })

    return typesResponse.ok
  } catch {
    return false
  }
}
