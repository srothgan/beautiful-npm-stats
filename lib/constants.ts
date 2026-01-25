// API endpoints
export const NPM_DOWNLOADS_API = "https://api.npmjs.org/downloads/range"
export const NPM_REGISTRY_API = "https://registry.npmjs.org"
export const NPM_SEARCH_API = "https://registry.npmjs.org/-/v1/search"

// Date range limits
export const MAX_DAYS_PER_REQUEST = 365 // npm API limit is 18 months, we use 1 year chunks
export const MAX_DATE_RANGE_DAYS = 730 // 2 years max

// npm data is delayed - stats for today don't exist yet
// We need to use yesterday as the most recent available date
export const NPM_DATA_DELAY_DAYS = 1

// UI constants
export const DEBOUNCE_MS = 300
export const MAX_COMPARE_PACKAGES = 4

// Chart colors for comparison mode
export const CHART_COLORS = [
  "hsl(221, 83%, 53%)", // blue
  "hsl(142, 71%, 45%)", // green
  "hsl(262, 83%, 58%)", // purple
  "hsl(25, 95%, 53%)",  // orange
] as const

// Date presets
export const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "1m", days: 30 },
  { label: "6m", days: 180 },
  { label: "1y", days: 365 },
  { label: "2y", days: 730 },
] as const

// Example packages for quick access
export const EXAMPLE_PACKAGES = [
  { name: "react", description: "A JavaScript library for building user interfaces" },
  { name: "vue", description: "The progressive JavaScript framework" },
  { name: "express", description: "Fast, unopinionated, minimalist web framework" },
  { name: "next", description: "The React Framework for the Web" },
  { name: "typescript", description: "TypeScript is a language for application scale JavaScript" },
] as const
