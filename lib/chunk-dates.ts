import { addDays, differenceInDays, min, subDays, startOfDay } from "date-fns"
import { MAX_DAYS_PER_REQUEST, NPM_DATA_DELAY_DAYS } from "./constants"
import type { DateRange } from "@/types/npm"

/**
 * Get the latest date that has npm download data available
 * npm data is delayed by ~1 day, so we use yesterday
 */
export function getLatestAvailableDate(): Date {
  const today = startOfDay(new Date())
  return subDays(today, NPM_DATA_DELAY_DAYS)
}

/**
 * Split a date range into chunks that fit within the npm API limit
 * The npm API allows max 18 months per request, we use 1 year chunks for safety
 */
export function chunkDateRange(start: Date, end: Date): DateRange[] {
  const chunks: DateRange[] = []
  let currentStart = start

  while (currentStart < end) {
    const chunkEnd = min([addDays(currentStart, MAX_DAYS_PER_REQUEST - 1), end])
    chunks.push({
      start: currentStart,
      end: chunkEnd,
    })
    currentStart = addDays(chunkEnd, 1)
  }

  return chunks
}

/**
 * Calculate the number of days in a date range
 */
export function getDaysInRange(start: Date, end: Date): number {
  return differenceInDays(end, start) + 1
}

/**
 * Get the previous period of the same length for comparison
 */
export function getPreviousPeriod(start: Date, end: Date): DateRange {
  const days = getDaysInRange(start, end)
  return {
    start: addDays(start, -days),
    end: addDays(start, -1),
  }
}
