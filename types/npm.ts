// npm API response types

export interface NpmDownloadsResponse {
  start: string
  end: string
  package: string
  downloads: DailyDownload[]
}

export interface DailyDownload {
  day: string
  downloads: number
}

export interface NpmPackageInfo {
  name: string
  description?: string
  version: string
  "dist-tags": {
    latest: string
    [key: string]: string
  }
  versions: Record<string, NpmVersionInfo>
  time: Record<string, string>
  maintainers: Array<{ name: string; email?: string }>
  keywords?: string[]
  homepage?: string
  repository?: {
    type: string
    url: string
  }
  license?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Dependency tree types
export interface DependencyNode {
  name: string
  version: string
  dependencies?: DependencyNode[]
}

export interface DependencyTreeResult {
  root: DependencyNode
  totalDependencies: number
  maxDepth: number
}

export interface GitHubRepo {
  owner: string
  repo: string
  url: string
}

export interface GitHubData {
  stars: number
  forks: number
  openIssues: number
  watchers: number
  license?: string
  defaultBranch: string
  description?: string
  homepage?: string
  contributors?: GitHubContributor[]
}

export interface GitHubContributor {
  login: string
  avatar_url: string
  contributions: number
  html_url: string
}

export interface NpmVersionInfo {
  name: string
  version: string
  description?: string
}

// Version downloads API response
export interface NpmVersionDownloadsResponse {
  package: string
  downloads: Record<string, number> // version -> download count
}

// Processed version download data
export interface VersionDownload {
  version: string
  downloads: number
  percentage: number
}

// Version release info with timestamp
export interface VersionRelease {
  version: string
  date: string // ISO date string
  isMajor: boolean
  isMinor: boolean
  isPatch: boolean
}

export interface NpmSearchResult {
  objects: Array<{
    package: {
      name: string
      version: string
      description?: string
      keywords?: string[]
      publisher: {
        username: string
        email?: string
      }
    }
    score: {
      final: number
      detail: {
        quality: number
        popularity: number
        maintenance: number
      }
    }
    searchScore: number
  }>
  total: number
  time: string
}

// Processed stats types

export interface PackageStats {
  packageName: string
  startDate: string
  endDate: string
  downloads: DailyDownload[]
  totalDownloads: number
  dailyAverage: number
  peakDay: {
    date: string
    downloads: number
  }
  growthRate: number // percentage compared to previous period
  latestVersion?: string
  lastUpdated?: string
  // Version data
  versionDownloads?: VersionDownload[]
  versionReleases?: VersionRelease[]
}

export interface DateRange {
  start: Date
  end: Date
}

export interface ChartDataPoint {
  date: string
  downloads: number
  formattedDate: string
}

// npms.io score data
export interface NpmsScore {
  quality: number
  popularity: number
  maintenance: number
  final: number
}

// Bundlephobia size data
export interface BundleSize {
  size: number // minified size in bytes
  gzip: number // gzipped size in bytes
  hasJSModule: boolean
  hasJSNext: boolean
  hasSideEffects: boolean
}

// Extended package metadata
export interface PackageMetadata {
  npmsScore?: NpmsScore
  bundleSize?: BundleSize
  hasTypeScript?: boolean // true if has types field or @types package exists
  releaseCadence?: {
    averageDaysBetweenReleases: number
    totalReleases: number
    lastReleaseDate: string
  }
}
