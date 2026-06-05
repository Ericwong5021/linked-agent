/** Agent service entry from YAML frontmatter */
export interface Service {
  name: string
  url: string
  tier?: string
}

/** Parsed section from agent markdown (## or ### heading + body) */
export interface AgentSection {
  title: string
  level: number
  content: string
}

/** Parsed agent from agency-agents repo */
export interface Agent {
  slug: string
  name: string
  description: string
  color: string
  emoji: string
  vibe: string
  division: string
  services?: Service[]
  sections: AgentSection[]
  rawMarkdown: string
}

/** Division grouping multiple agents */
export interface Division {
  name: string
  agents: Agent[]
}

/** Cache metadata stored alongside agents.json */
export interface CacheMeta {
  fetchedAt: string
  agentCount: number
  divisionCount: number
}

/** Options controlling fetch and cache behavior */
export interface FetchOptions {
  /** Force fresh fetch, ignoring cache */
  noCache?: boolean
  /** Custom cache directory (default ~/.linked-agent/cache/) */
  cacheDir?: string
  /** GitHub API base URL (default https://api.github.com) */
  githubApiBase?: string
  /** GitHub raw content base URL */
  githubRawBase?: string
  /** Request timeout in milliseconds */
  timeoutMs?: number
  /** Number of retries for transient network/API failures */
  retries?: number
  /** GitHub token, defaults to GITHUB_TOKEN or GH_TOKEN environment variables */
  token?: string
}

export const DEFAULT_CACHE_DIR = '~/.linked-agent/cache/'
export const GITHUB_API_BASE = 'https://api.github.com'
export const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com'
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
