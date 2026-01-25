"use client"

import * as React from "react"
import { Plus, Loader2, ArrowRight, Terminal, X, TrendingUp, Star, Wrench } from "lucide-react"
import { parseAsArrayOf, parseAsIsoDate, parseAsString, useQueryStates } from "nuqs"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRangePicker } from "@/components/date-range-picker"
import { DEBOUNCE_MS, MAX_COMPARE_PACKAGES, CHART_COLORS } from "@/lib/constants"
import { StatsCard } from "@/components/stats-card"
import { cn } from "@/lib/utils"
import { searchNpmPackages, type SearchResult } from "@/app/actions/fetch-stats"
import type { PackageStats } from "@/types/npm"

interface ComparePageClientProps {
  initialPackages: string[]
  initialStart: string
  initialEnd: string
}

export function ComparePageClient({
  initialPackages,
  initialStart,
  initialEnd,
}: ComparePageClientProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const debounceRef = React.useRef<NodeJS.Timeout>(null)

  const [{ packages, start, end }, setParams] = useQueryStates(
    {
      packages: parseAsArrayOf(parseAsString, ",").withDefault(initialPackages),
      start: parseAsIsoDate.withDefault(new Date(initialStart)),
      end: parseAsIsoDate.withDefault(new Date(initialEnd)),
    },
    {
      shallow: false,
    }
  )

  const doSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await searchNpmPackages(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      doSearch(query)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, doSearch])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-muted-foreground"
  }

  const addPackage = (packageName: string) => {
    if (packages.length < MAX_COMPARE_PACKAGES && !packages.includes(packageName)) {
      setParams({ packages: [...packages, packageName] })
    }
    setOpen(false)
    setQuery("")
  }

  const removePackage = (packageName: string) => {
    setParams({ packages: packages.filter((p) => p !== packageName) })
  }

  const handleRangeChange = (newStart: Date, newEnd: Date) => {
    setParams({ start: newStart, end: newEnd })
  }

  return (
    <div className="space-y-4">
      {/* Selected packages */}
      <div className="flex flex-wrap items-center gap-2">
        {packages.map((pkg) => (
          <div
            key={pkg}
            className="group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg bg-card/50 border border-border/50 transition-all duration-200 hover:bg-card hover:border-border"
          >
            <span className="font-medium text-sm">{pkg}</span>
            <button
              onClick={() => removePackage(pkg)}
              className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {packages.length < MAX_COMPARE_PACKAGES && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  "border border-dashed border-border/50 bg-transparent",
                  "text-sm font-medium text-muted-foreground",
                  "hover:border-primary/50 hover:text-foreground hover:bg-primary/5",
                  "transition-all duration-200"
                )}
              >
                <Plus className="h-4 w-4" />
                Add package
                <span className="text-xs text-muted-foreground">
                  ({packages.length}/{MAX_COMPARE_PACKAGES})
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-100 max-w-100 p-0 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl"
              align="start"
            >
              <Command shouldFilter={false} className="bg-transparent">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <Terminal className="h-4 w-4 text-accent" />
                  <span className="text-accent font-mono">$</span>
                  <CommandInput
                    placeholder="npm search"
                    value={query}
                    onValueChange={setQuery}
                    className="flex-1 bg-transparent border-0 focus:ring-0 font-mono text-sm placeholder:text-muted-foreground"
                  />
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  )}
                </div>
                <CommandList className="max-h-75">
                  {!isLoading && query && results.length === 0 && (
                    <CommandEmpty>
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground font-mono">
                          No packages found
                        </p>
                      </div>
                    </CommandEmpty>
                  )}

                  {!isLoading && results.length > 0 && (
                    <CommandGroup>
                      {results
                        .filter((pkg) => !packages.includes(pkg.name))
                        .map((pkg, index) => (
                          <CommandItem
                            key={pkg.name}
                            value={pkg.name}
                            onSelect={() => addPackage(pkg.name)}
                            className="group/item flex items-start gap-3 px-4 py-3 cursor-pointer data-[selected=true]:bg-accent/10"
                          >
                            <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 font-mono text-xs text-muted-foreground group-data-[selected=true]/item:bg-accent/20 group-data-[selected=true]/item:text-accent">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-semibold text-foreground truncate">
                                    {pkg.name}
                                  </span>
                                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                                    v{pkg.version}
                                  </span>
                                </div>
                                {/* Overall score badge - always visible */}
                                <span className={cn(
                                  "text-xs font-mono px-1.5 py-0.5 rounded shrink-0",
                                  pkg.score.final >= 80 ? "bg-green-500/10 text-green-500" :
                                  pkg.score.final >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                                  "bg-muted text-muted-foreground"
                                )}>
                                  {pkg.score.final}
                                </span>
                              </div>
                              {pkg.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {pkg.description}
                                </p>
                              )}
                              {/* Detailed scores - hidden on mobile */}
                              <div className="hidden sm:flex items-center gap-3">
                                <div className="flex items-center gap-1" title="Popularity">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className={cn("text-xs font-mono", getScoreColor(pkg.score.popularity))}>
                                    {pkg.score.popularity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1" title="Quality">
                                  <Star className="h-3 w-3 text-muted-foreground" />
                                  <span className={cn("text-xs font-mono", getScoreColor(pkg.score.quality))}>
                                    {pkg.score.quality}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1" title="Maintenance">
                                  <Wrench className="h-3 w-3 text-muted-foreground" />
                                  <span className={cn("text-xs font-mono", getScoreColor(pkg.score.maintenance))}>
                                    {pkg.score.maintenance}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground opacity-0 group-data-[selected=true]/item:opacity-100 group-data-[selected=true]/item:text-accent transition-opacity" />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Date range picker */}
      <DateRangePicker
        startDate={start}
        endDate={end}
        onRangeChange={handleRangeChange}
      />
    </div>
  )
}

interface CompareStatsCardsProps {
  stats: PackageStats[]
  dateRange?: { start: Date; end: Date }
}

export function CompareStatsCards({ stats, dateRange }: CompareStatsCardsProps) {
  const [, setParams] = useQueryStates(
    {
      packages: parseAsArrayOf(parseAsString, ","),
    },
    {
      shallow: false,
    }
  )

  const removePackage = (packageName: string) => {
    const currentPackages = stats.map((s) => s.packageName)
    setParams({ packages: currentPackages.filter((p) => p !== packageName) })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((pkgStats, index) => (
        <div
          key={pkgStats.packageName}
          className="relative animate-fade-up"
          style={{ animationDelay: `${(index + 2) * 50}ms` }}
        >
          {/* Rank badge */}
          <div
            className="absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold shadow-lg"
            style={{
              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              color: 'white'
            }}
          >
            #{index + 1}
          </div>
          <StatsCard 
            stats={pkgStats} 
            onRemove={() => removePackage(pkgStats.packageName)}
            dateRange={dateRange}
          />
        </div>
      ))}
    </div>
  )
}
