/** Supported remote agent inventories. */
export type AgentSource = 'agency' | 'lobehub' | 'all'

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

/** Parsed agent from a supported agent inventory */
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
  /** Source inventory identifier. Defaults to agency for older cache files. */
  source?: Exclude<AgentSource, 'all'>
  /** Original source identifier when it differs from slug. */
  sourceId?: string
  /** Tags from marketplace-style sources. */
  tags?: string[]
  /** Author or publisher from marketplace-style sources. */
  author?: string
  /** Human-facing source URL. */
  sourceUrl?: string
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
  source?: AgentSource
}

/** Options controlling fetch and cache behavior */
export interface FetchOptions {
  /** Force fresh fetch, ignoring cache */
  noCache?: boolean
  /** Custom cache directory (default ~/.linked-agent/cache/) */
  cacheDir?: string
  /** Agent source inventory to use */
  source?: AgentSource
  /** GitHub API base URL (default https://api.github.com) */
  githubApiBase?: string
  /** GitHub raw content base URL */
  githubRawBase?: string
  /** LobeHub agent index URL */
  lobeIndexUrl?: string
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
export const LOBEHUB_AGENT_MARKET_URL = 'https://lobehub.com/agent'
export const LOBEHUB_INDEX_URL = 'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public/index.zh-CN.json'
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
