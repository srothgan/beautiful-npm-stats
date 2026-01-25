import { Github, Terminal, Zap, Database, Code2 } from "lucide-react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about npm stats and how it works.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent/10 border border-primary/20">
            <Terminal className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              About
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              npm package analytics
            </p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          A modern, open-source tool for visualizing npm package download statistics.
          Built for developers who care about beautiful data.
        </p>
      </div>

      <div className="space-y-12">
        {/* What is this */}
        <section className="animate-fade-up stagger-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Zap className="h-5 w-5 text-primary" />
            What is this?
          </h2>
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-mono text-primary">npm stats</span> provides a clean,
              modern interface to explore download statistics for any npm package.
              View trends over time, compare multiple packages side by side,
              and share your findings with shareable URLs.
            </p>
          </div>
        </section>

        {/* Data sources */}
        <section className="animate-fade-up stagger-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Database className="h-5 w-5 text-accent" />
            Data Sources
          </h2>
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We aggregate data from multiple sources to provide comprehensive package insights:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">•</span>
                <span>
                  <Link
                    href="https://github.com/npm/registry/blob/master/docs/download-counts.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    npm Registry API
                  </Link>
                  {" "}— download statistics, package metadata, version info, and dependencies
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">•</span>
                <span>
                  <Link
                    href="https://docs.github.com/en/rest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    GitHub API
                  </Link>
                  {" "}— repository stars, forks, issues, and top contributors
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">•</span>
                <span>
                  <Link
                    href="https://bundlephobia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Bundlephobia
                  </Link>
                  {" "}— bundle size and gzip analysis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">•</span>
                <span>
                  <Link
                    href="https://npms.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    npms.io
                  </Link>
                  {" "}— quality, popularity, and maintenance scores
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground/70 pt-2">
              Data is cached between 1-24 hours depending on the source.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="animate-fade-up stagger-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Code2 className="h-5 w-5 text-chart-3" />
            FAQ
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "How accurate is the data?",
                a: "The data is as accurate as the npm registry provides. Download counts include all installs via npm and yarn, but may not capture downloads from mirrors or caches."
              },
              {
                q: "What's the maximum date range?",
                a: "You can view up to 2 years (730 days) of download history for any package."
              },
              {
                q: "How many packages can I compare?",
                a: "You can compare up to 3 packages at a time in the comparison view."
              },
              {
                q: "Are the URLs shareable?",
                a: "Yes! All URLs preserve your exact view including selected packages and date ranges. Perfect for sharing in documentation or discussions."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-card/30 border border-border/50 hover:border-primary/20 transition-colors"
              >
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section className="animate-fade-up stagger-5 flex flex-wrap gap-3 pt-4">
          <Button variant="outline" asChild className="gap-2">
            <Link
              href="https://github.com/srothgan/beautiful-npm-stats"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
