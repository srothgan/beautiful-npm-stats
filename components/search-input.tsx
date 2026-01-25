"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/package/${encodeURIComponent(query.trim())}`)
      setQuery("")
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 w-full font-mono",
        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/50 hover:bg-card/80",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
        "transition-all duration-200",
        size === "lg" ? "h-14 px-5 text-base" : "h-11 px-4 text-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
        <Terminal className={cn(size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
        <span className="text-primary">$</span>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-2">
        <Search className={cn(
          "text-muted-foreground group-hover:text-primary transition-colors",
          size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
        )} />
      </div>
    </div>
  )
}
