"use client"

import { Users, GitCommit } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NpmPackageInfo, GitHubContributor } from "@/types/npm"
import Image from "next/image"

interface MaintainersProps {
  maintainers: NpmPackageInfo["maintainers"]
  className?: string
}

export function Maintainers({ maintainers, className }: MaintainersProps) {
  if (!maintainers || maintainers.length === 0) return null

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Gradient accent top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-border/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">Maintainers</h3>
          <p className="text-xs text-muted-foreground font-mono">
            {maintainers.length} {maintainers.length === 1 ? "person" : "people"}
          </p>
        </div>
      </div>

      {/* Maintainers list */}
      <div className="p-4">
        <div className="space-y-2">
          {maintainers.map((maintainer, index) => (
            <div
              key={`${maintainer.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 text-sm font-bold">
                {maintainer.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{maintainer.name}</p>
                {maintainer.email && (
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {maintainer.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ContributorsProps {
  contributors: GitHubContributor[]
  className?: string
}

export function Contributors({ contributors, className }: ContributorsProps) {
  if (!contributors || contributors.length === 0) return null

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Gradient accent top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-border/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
          <GitCommit className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">Top 10 Contributors</h3>
          <p className="text-xs text-muted-foreground font-mono">
            By commits
          </p>
        </div>
      </div>

      {/* Contributors list */}
      <div className="p-4">
        <div className="space-y-2">
          {contributors.map((contributor, index) => (
            <a
              key={contributor.login}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                <Image
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {contributor.login}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {contributor.contributions.toLocaleString()} contributions
                </p>
              </div>
              {index === 0 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                  TOP
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
