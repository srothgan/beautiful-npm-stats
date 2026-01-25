"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up">
        {/* Error display */}
        <div className="mb-8 p-6 rounded-2xl bg-card/50 border border-destructive/30 font-mono text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive">error</span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-destructive">
              {error.message || "An unexpected error occurred"}
            </p>
            {error.digest && (
              <p className="text-muted-foreground text-xs">
                Digest: {error.digest}
              </p>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-destructive">Something</span>{" "}
          <span className="text-muted-foreground">went wrong</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          An error occurred while loading this page. Please try again.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
