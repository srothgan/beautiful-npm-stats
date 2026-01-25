import type { DailyDownload } from "@/types/npm"

/**
 * Calculate stats from download data
 */
export function calculateStats(
  downloads: DailyDownload[],
  previousDownloads?: DailyDownload[]
): {
  totalDownloads: number
  dailyAverage: number
  peakDay: { date: string; downloads: number }
  growthRate: number
} {
  const totalDownloads = downloads.reduce((sum, d) => sum + d.downloads, 0)
  const dailyAverage = Math.round(totalDownloads / downloads.length)

  const peakDay = downloads.reduce(
    (max, d) => (d.downloads > max.downloads ? d : max),
    downloads[0]
  )

  let growthRate = 0
  if (previousDownloads && previousDownloads.length > 0) {
    const previousTotal = previousDownloads.reduce(
      (sum, d) => sum + d.downloads,
      0
    )
    if (previousTotal > 0) {
      growthRate = ((totalDownloads - previousTotal) / previousTotal) * 100
    }
  }

  return {
    totalDownloads,
    dailyAverage,
    peakDay: { date: peakDay.day, downloads: peakDay.downloads },
    growthRate,
  }
}
