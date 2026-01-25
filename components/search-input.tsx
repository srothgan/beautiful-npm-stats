"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Terminal, Loader2, TrendingUp, Star, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchNpmPackages, type SearchResult } from "@/app/actions/fetch-stats"
import { DEBOUNCE_MS } from "@/lib/constants"

interface SearchInputProps {
  className?: string
  placeholder?: string
  size?: "default" | "lg"
  autoFocus?: boolean
}

export function SearchInput({
  className,
  placeholder = "Search npm packages...",
  size = "default",
  autoFocus = false,
}: SearchInputProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      const searchResults = await searchNpmPackages(query)
      setResults(searchResults)
      setIsOpen(searchResults.length > 0)
      setIsLoading(false)
      setSelectedIndex(-1)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navigateToPackage = (packageName: string) => {
    router.push(`/package/${encodeURIComponent(packageName)}`)
    setQuery("")
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        navigateToPackage(query.trim())
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          navigateToPackage(results[selectedIndex].name)
        } else if (query.trim()) {
          navigateToPackage(query.trim())
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-muted-foreground"
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "group flex items-center gap-3 w-full font-mono",
          "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:border-primary/50 hover:bg-card/80",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
          "transition-all duration-200",
          size === "lg" ? "h-14 px-5 text-base" : "h-11 px-4 text-sm",
          isOpen && "rounded-b-none border-b-transparent",
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
          <Terminal className={cn(size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
          <span className="text-primary">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className={cn(
              "animate-spin text-primary",
              size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          ) : (
            <Search className={cn(
              "text-muted-foreground group-hover:text-primary transition-colors",
              size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full rounded-b-xl border border-t-0 border-border/50 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.name}
                onClick={() => navigateToPackage(result.name)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  "hover:bg-primary/10 focus:bg-primary/10 focus:outline-none",
                  "border-b border-border/30 last:border-b-0",
                  selectedIndex === index && "bg-primary/10"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {result.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        v{result.version}
                      </span>
                    </div>
                    {/* Overall score badge - always visible */}
                    <span className={cn(
                      "text-xs font-mono px-1.5 py-0.5 rounded shrink-0",
                      result.score.final >= 80 ? "bg-green-500/10 text-green-500" :
                      result.score.final >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {result.score.final}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </p>
                  )}
                  {/* Detailed scores - hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1" title="Popularity">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className={cn("text-xs font-mono", getScoreColor(result.score.popularity))}>
                        {result.score.popularity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title="Quality">
                      <Star className="h-3 w-3 text-muted-foreground" />
                      <span className={cn("text-xs font-mono", getScoreColor(result.score.quality))}>
                        {result.score.quality}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title="Maintenance">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      <span className={cn("text-xs font-mono", getScoreColor(result.score.maintenance))}>
                        {result.score.maintenance}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer hint - hidden on touch devices */}
          <div className="hidden sm:block px-4 py-2 bg-muted/30 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
              {" "}navigate{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd>
              {" "}select{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd>
              {" "}close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
