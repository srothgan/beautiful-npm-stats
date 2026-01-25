import type {
  NpmPackageInfo,
  GitHubRepo,
  GitHubData,
  GitHubContributor,
} from "@/types/npm"

/**
 * Parse GitHub repository URL from npm package info
 */
export function parseGitHubRepo(packageInfo: NpmPackageInfo): GitHubRepo | null {
  const repo = packageInfo.repository
  if (!repo || repo.type !== "git") return null

  const url = repo.url
  // Match github.com URLs in various formats
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/i)
  if (!match) return null

  const [, owner, repoName] = match
  return {
    owner,
    repo: repoName.replace(/\.git$/, ""),
    url: `https://github.com/${owner}/${repoName.replace(/\.git$/, "")}`,
  }
}

/**
 * Fetch GitHub repository data
 */
export async function fetchGitHubData(
  owner: string,
  repo: string
): Promise<GitHubData | null> {
  try {
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`
    const contributorsUrl = `${repoUrl}/contributors?per_page=10`

    const [repoResponse, contributorsResponse] = await Promise.all([
      fetch(repoUrl, {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }),
      fetch(contributorsUrl, {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }),
    ])

    if (!repoResponse.ok) return null

    const repoData = await repoResponse.json()
    const contributors: GitHubContributor[] = contributorsResponse.ok
      ? await contributorsResponse.json()
      : []

    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      watchers: repoData.watchers_count || 0,
      license: repoData.license?.name,
      defaultBranch: repoData.default_branch || "main",
      description: repoData.description,
      homepage: repoData.homepage,
      contributors: contributors.slice(0, 10),
    }
  } catch {
    return null
  }
}
