import Link from "next/link"
import { ArrowRight, TrendingUp, Zap, Share2, Terminal, ChevronRight } from "lucide-react"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { EXAMPLE_PACKAGES } from "@/lib/constants"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center">
            {/* Terminal-style badge */}
            <div className="animate-fade-up stagger-1 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 font-mono text-sm">
                <span className="text-primary">$</span>
                <span className="text-muted-foreground">npm stats</span>
                <span className="text-accent">--beautiful</span>
              </div>
            </div>

            {/* Main headline */}
            <h1 className="animate-fade-up stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Track every{" "}
              <span className="gradient-text">download</span>
              <br />
              <span className="text-muted-foreground">visualize the trends</span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up stagger-3 mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Beautiful analytics for npm packages. Compare downloads,
              track growth, and share insights with stunning visualizations.
            </p>

            {/* Search */}
            <div className="animate-fade-up stagger-4 mt-12 w-full max-w-xl">
              <SearchInput
                size="lg"
                className="w-full"
                placeholder="Search any npm package..."
              />
            </div>

            {/* Quick examples */}
            <div className="animate-fade-up stagger-5 mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">
                <span className="text-primary">$</span> try:
              </span>
              {EXAMPLE_PACKAGES.slice(0, 4).map((pkg) => (
                <Link
                  key={pkg.name}
                  href={`/package/${pkg.name}`}
                  className="group inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all duration-200"
                >
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {pkg.name}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-primary">analyze</span> packages
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 card-hover">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interactive charts showing daily downloads, growth rates,
                  and peak activity over any time range.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-6 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all duration-300 card-hover">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Compare Packages</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Side-by-side comparison of up to 3 packages with overlay
                  charts and winner highlighting.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-6 rounded-xl bg-card/50 border border-border/50 hover:border-chart-3/30 transition-all duration-300 card-hover">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3 mb-4">
                  <Share2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Share Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Shareable URLs that preserve your exact view.
                  Perfect for documentation and discussions.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="group gap-2 font-semibold">
              <Link href="/compare">
                Compare packages
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Popular packages
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_PACKAGES.map((pkg, index) => (
              <Link
                key={pkg.name}
                href={`/package/${pkg.name}`}
                className="group relative flex flex-col p-5 rounded-xl bg-card/30 border border-border/50 hover:border-primary/30 transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50 font-mono text-xs text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {pkg.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 pl-11">
                  {pkg.description}
                </p>
                <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
