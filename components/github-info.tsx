"use client"

import { Star, GitFork, AlertCircle, ExternalLink } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { GitHubData, GitHubRepo } from "@/types/npm"

interface GitHubInfoProps {
  githubData: GitHubData
  githubRepo: GitHubRepo
  className?: string
}

export function GitHubInfo({ githubData, githubRepo, className }: GitHubInfoProps) {
  const stats = [
    {
      icon: Star,
      label: "Stars",
      value: formatNumber(githubData.stars),
      color: "text-yellow-500",
    },
    {
      icon: GitFork,
      label: "Forks",
      value: formatNumber(githubData.forks),
      color: "text-blue-500",
    },
    {
      icon: AlertCircle,
      label: "Open Issues",
      value: formatNumber(githubData.openIssues),
      color: "text-red-500",
    },
  ]

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Gradient accent top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="p-6">
        {/* Header with GitHub link */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Repository</h3>
            <a
              href={githubRepo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono group"
            >
              <span>{githubRepo.owner}/{githubRepo.repo}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          
          {githubData.license && (
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground">
                {githubData.license}
              </p>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50", stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-mono font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
