import Link from "next/link"
import { Home, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up">
        {/* Terminal-style 404 */}
        <div className="mb-8 p-6 rounded-2xl bg-card/50 border border-border/50 font-mono text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <div className="h-3 w-3 rounded-full bg-destructive/50" />
            <div className="h-3 w-3 rounded-full bg-primary/50" />
            <div className="h-3 w-3 rounded-full bg-chart-4/50" />
            <span className="ml-2 text-xs text-muted-foreground">terminal</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-primary">$</span>{" "}
              <span className="text-muted-foreground">npm stats</span>{" "}
              <span className="text-foreground">not-found</span>
            </p>
            <p className="text-destructive">
              Error: Package or page not found
            </p>
            <p className="text-muted-foreground">
              The requested resource doesn&apos;t exist.
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-muted-foreground">404</span>{" "}
          <span className="text-primary">Not Found</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/compare">
              <GitCompare className="h-4 w-4" />
              Compare packages
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
