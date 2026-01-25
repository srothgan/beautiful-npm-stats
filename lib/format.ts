import { format, formatDistanceToNow } from "date-fns"

/**
 * Format a number with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

/**
 * Format a number with full locale string
 */
export function formatNumberFull(num: number): string {
  return num.toLocaleString()
}

/**
 * Format a date for display (international format)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "d MMM yyyy")
}

/**
 * Format a date for display (short, no year)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "d MMM")
}

/**
 * Format a date for chart axis
 */
export function formatChartDate(date: Date | string, includeYear = false): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, includeYear ? "d MMM yy" : "d MMM")
}

/**
 * Format a date as ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format growth rate as percentage
 */
export function formatGrowthRate(rate: number): string {
  const sign = rate >= 0 ? "+" : ""
  return `${sign}${rate.toFixed(1)}%`
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`
}
