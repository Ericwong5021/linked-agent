import type { Agent, Division, FetchOptions } from './types.js'
import { fetchAllAgents } from './fetcher.js'
import { parseAllAgents } from './parser.js'
import {
  getCacheDir,
  isCacheValid,
  readCache,
  writeCache,
} from './cache.js'

export type { Agent, AgentSection, Service, Division, FetchOptions } from './types.js'

/**
 * Fetch and cache all agents from the agency-agents repo.
 *
 * - Cache hit (and no --no-cache): returns cached data instantly
 * - Cache miss or --no-cache: fetches from GitHub, parses, caches, and returns
 *
 * @returns Array of parsed Agent objects
 */
export async function fetchAgents(
  opts?: FetchOptions
): Promise<Agent[]> {
  const cacheDir = getCacheDir(opts?.cacheDir)

  // Check cache
  if (!opts?.noCache && isCacheValid(cacheDir)) {
    return readCache(cacheDir)
  }

  // Fetch from GitHub
  const files = await fetchAllAgents({
    githubApiBase: opts?.githubApiBase,
    githubRawBase: opts?.githubRawBase,
    timeoutMs: opts?.timeoutMs,
    retries: opts?.retries,
    token: opts?.token,
  })

  const agents = parseAllAgents(files)

  // Write cache
  writeCache(cacheDir, agents)

  return agents
}

/**
 * Group agents by division.
 */
export function groupByDivision(agents: Agent[]): Division[] {
  const map = new Map<string, Agent[]>()
  for (const agent of agents) {
    const existing = map.get(agent.division) ?? []
    existing.push(agent)
    map.set(agent.division, existing)
  }

  return Array.from(map.entries())
    .map(([name, agents]) => ({ name, agents }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Find an agent by exact slug match.
 */
export function findAgentBySlug(
  agents: Agent[],
  slug: string
): Agent | undefined {
  return agents.find((a) => a.slug === slug)
}

/**
 * Find agents by partial slug match (case-insensitive substring).
 * Returns all agents whose slug contains the query string.
 */
export function findAgentsByPartialSlug(
  agents: Agent[],
  slug: string
): Agent[] {
  const q = slug.toLowerCase()
  return agents.filter((a) => a.slug.toLowerCase().includes(q))
}

/**
 * Search agents by name, description, or vibe (case-insensitive).
 */
export function searchAgents(agents: Agent[], query: string): Agent[] {
  const q = query.toLowerCase()
  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.vibe.toLowerCase().includes(q)
  )
}
