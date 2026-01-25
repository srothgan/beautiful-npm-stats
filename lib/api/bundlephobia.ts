import type { BundleSize } from "@/types/npm"

/**
 * Fetch bundle size from Bundlephobia
 */
export async function fetchBundleSize(packageName: string): Promise<BundleSize | null> {
  try {
    const url = `https://bundlephobia.com/api/size?package=${encodeURIComponent(packageName)}`
    const response = await fetch(url, { next: { revalidate: 86400 } }) // Cache 24h

    if (!response.ok) return null

    const data = await response.json()

    return {
      size: data.size,
      gzip: data.gzip,
      hasJSModule: data.hasJSModule || false,
      hasJSNext: data.hasJSNext || false,
      hasSideEffects: data.hasSideEffects !== false,
    }
  } catch {
    return null
  }
}
