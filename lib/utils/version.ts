import type { NpmPackageInfo, VersionRelease } from "@/types/npm"

/**
 * Parse semver version string to determine version type
 */
export function parseVersionType(version: string): { isMajor: boolean; isMinor: boolean; isPatch: boolean } {
  // Filter out pre-release versions (canary, next, experimental, rc, beta, alpha)
  const isPreRelease = /-(canary|next|experimental|rc|beta|alpha|dev)/i.test(version)
  if (isPreRelease) {
    return { isMajor: false, isMinor: false, isPatch: false }
  }

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    return { isMajor: false, isMinor: false, isPatch: false }
  }

  const [, , minor, patch] = match
  return {
    isMajor: minor === "0" && patch === "0",
    isMinor: patch === "0" && minor !== "0",
    isPatch: patch !== "0",
  }
}

/**
 * Extract version releases from package info within a date range
 */
export function extractVersionReleases(
  packageInfo: NpmPackageInfo,
  startDate: Date,
  endDate: Date
): VersionRelease[] {
  const releases: VersionRelease[] = []
  const timeEntries = packageInfo.time

  for (const [version, dateStr] of Object.entries(timeEntries)) {
    // Skip non-version entries like "created" and "modified"
    if (version === "created" || version === "modified") continue

    const releaseDate = new Date(dateStr)
    if (releaseDate >= startDate && releaseDate <= endDate) {
      const versionType = parseVersionType(version)
      // Only include stable releases (major, minor, or patch)
      if (versionType.isMajor || versionType.isMinor || versionType.isPatch) {
        releases.push({
          version,
          date: dateStr.split("T")[0], // Just the date part
          ...versionType,
        })
      }
    }
  }

  // Sort by date
  return releases.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Calculate release cadence from package info
 */
export function calculateReleaseCadence(
  packageInfo: NpmPackageInfo
): { averageDaysBetweenReleases: number; totalReleases: number; lastReleaseDate: string } | null {
  const timeEntries = Object.entries(packageInfo.time)
    .filter(([key]) => key !== "created" && key !== "modified")
    .map(([, date]) => ({ date: new Date(date) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (timeEntries.length < 2) return null

  const firstRelease = timeEntries[0].date
  const lastRelease = timeEntries[timeEntries.length - 1].date
  const daysBetween = (lastRelease.getTime() - firstRelease.getTime()) / (1000 * 60 * 60 * 24)
  const averageDays = daysBetween / (timeEntries.length - 1)

  return {
    averageDaysBetweenReleases: Math.round(averageDays),
    totalReleases: timeEntries.length,
    lastReleaseDate: lastRelease.toISOString().split("T")[0],
  }
}
