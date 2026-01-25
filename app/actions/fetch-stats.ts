"use server"

import { z } from "zod"
import { getPackageStats, searchPackages } from "@/lib"
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants"
import { differenceInDays } from "date-fns"
import type { PackageStats } from "@/types/npm"

const fetchStatsSchema = z.object({
  packageName: z.string().min(1, "Package name is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
})

export type FetchStatsResult =
  | { success: true; data: PackageStats }
  | { success: false; error: string }

export async function fetchStats(
  packageName: string,
  startDate: string,
  endDate: string
): Promise<FetchStatsResult> {
  try {
    // Validate input
    const validated = fetchStatsSchema.parse({
      packageName,
      startDate,
      endDate,
    })

    const start = new Date(validated.startDate)
    const end = new Date(validated.endDate)

    // Validate date range
    if (start > end) {
      return { success: false, error: "Start date must be before end date" }
    }

    if (differenceInDays(end, start) > MAX_DATE_RANGE_DAYS) {
      return {
        success: false,
        error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`,
      }
    }

    if (end > new Date()) {
      return { success: false, error: "End date cannot be in the future" }
    }

    // Fetch stats
    const stats = await getPackageStats(validated.packageName, start, end)
    return { success: true, data: stats }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
      return { success: false, error: issues[0]?.message || "Validation error" }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}

export type SearchResult = {
  name: string
  description?: string
  version: string
}

export async function searchNpmPackages(
  query: string
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return []
  }

  try {
    const results = await searchPackages(query, 8)
    return results.objects.map((obj) => ({
      name: obj.package.name,
      description: obj.package.description,
      version: obj.package.version,
    }))
  } catch {
    return []
  }
}
