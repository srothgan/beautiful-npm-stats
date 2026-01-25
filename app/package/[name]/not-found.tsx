import Link from "next/link"
import { Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PackageNotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up">
        {/* Package not found visual */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/30 border border-border/50 mx-auto">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-primary">Package</span>{" "}
          <span className="text-muted-foreground">not found</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          This package doesn&apos;t exist on npm or has no download data available.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/">
              <Search className="h-4 w-4" />
              Search packages
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/compare">
              <Package className="h-4 w-4" />
              Compare packages
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
