import type { NpmsScore } from "@/types/npm"

/**
 * Fetch npms.io score for a package
 */
export async function fetchNpmsScore(packageName: string): Promise<NpmsScore | null> {
  try {
    const url = `https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) return null

    const data = await response.json()
    const score = data.score

    return {
      quality: Math.round(score.detail.quality * 100),
      popularity: Math.round(score.detail.popularity * 100),
      maintenance: Math.round(score.detail.maintenance * 100),
      final: Math.round(score.final * 100),
    }
  } catch {
    return null
  }
}
