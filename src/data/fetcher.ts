import { GITHUB_API_BASE, GITHUB_RAW_BASE } from './types.js'

const REPO_OWNER = 'msitarzewski'
const REPO_NAME = 'agency-agents'
const BRANCH = 'main'

interface GitHubTreeEntry {
  path: string
  type: string
  size?: number
}

interface GitHubFileContent {
  content: string
  encoding?: string
}

/**
 * Fetch directory listing from GitHub contents API.
 * Returns paths of .md files in the given directory.
 */
async function listMdFiles(
  dirPath: string,
  apiBase: string
): Promise<string[]> {
  const url = `${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dirPath}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'linked-agent-cli',
    },
  })

  if (!res.ok) {
    throw new Error(
      `GitHub API error ${res.status}: ${res.statusText} (path: ${dirPath})`
    )
  }

  const items = (await res.json()) as Array<{ name: string; type: string; path: string }>
  return items
    .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
    .map((item) => item.path)
}

/**
 * Fetch file content via raw.githubusercontent.com for speed.
 */
async function fetchRawContent(
  filePath: string,
  rawBase: string
): Promise<string> {
  const url = `${rawBase}/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'linked-agent-cli' },
  })

  if (!res.ok) {
    throw new Error(
      `GitHub Raw error ${res.status}: ${res.statusText} (file: ${filePath})`
    )
  }

  return res.text()
}

/**
 * Fetch all division directories at repo root level.
 * Returns directory names (e.g. ["engineering", "design", ...]).
 */
async function listDivisions(apiBase: string): Promise<string[]> {
  const url = `${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'linked-agent-cli',
    },
  })

  if (!res.ok) {
    throw new Error(
      `GitHub API error ${res.status}: ${res.statusText} (path: /)`
    )
  }

  const items = (await res.json()) as Array<{ name: string; type: string }>
  return items
    .filter((item) => item.type === 'dir' && !item.name.startsWith('.'))
    .map((item) => item.name)
}

export interface FetchedFile {
  path: string
  content: string
}

/**
 * Fetch all agent markdown files from the agency-agents repo.
 * Strategy: list divisions → for each division, list .md files → fetch each file.
 */
export async function fetchAllAgents(opts?: {
  githubApiBase?: string
  githubRawBase?: string
}): Promise<FetchedFile[]> {
  const apiBase = opts?.githubApiBase ?? GITHUB_API_BASE
  const rawBase = opts?.githubRawBase ?? GITHUB_RAW_BASE

  const divisions = await listDivisions(apiBase)
  const files: FetchedFile[] = []

  // Fetch files in batches to be gentle on the API
  for (const division of divisions) {
    const mdPaths = await listMdFiles(division, apiBase)
    for (const mdPath of mdPaths) {
      const content = await fetchRawContent(mdPath, rawBase)
      files.push({ path: mdPath, content })
    }
  }

  return files
}

/** Check GitHub API rate limit status */
export async function checkRateLimit(apiBase?: string): Promise<{
  remaining: number
  reset: string
}> {
  const url = `${apiBase ?? GITHUB_API_BASE}/rate_limit`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'linked-agent-cli',
    },
  })

  if (!res.ok) {
    throw new Error(`Rate limit check failed: ${res.status}`)
  }

  const data = (await res.json()) as { resources: { core: { remaining: number; reset: number } } }
  return {
    remaining: data.resources.core.remaining,
    reset: new Date(data.resources.core.reset * 1000).toISOString(),
  }
}
