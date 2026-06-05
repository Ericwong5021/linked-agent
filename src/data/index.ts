import type { Agent, AgentSource, Division, FetchOptions } from './types.js'
import { fetchAgencyAgentFiles, fetchLobeHubAgents } from './fetcher.js'
import { parseAllAgents } from './parser.js'
import {
  getCacheDir,
  isCacheValid,
  readCache,
  writeCache,
} from './cache.js'

export type { Agent, AgentSection, AgentSource, Service, Division, FetchOptions } from './types.js'

function normalizeSource(source?: string): AgentSource {
  if (!source) return 'agency'
  if (source === 'agency' || source === 'lobehub' || source === 'all') return source
  throw new Error(`Unsupported agent source "${source}". Use agency, lobehub, or all.`)
}

async function fetchAgentsForSource(
  source: Exclude<AgentSource, 'all'>,
  cacheDir: string,
  opts?: FetchOptions
): Promise<Agent[]> {
  if (!opts?.noCache && isCacheValid(cacheDir, source)) {
    return readCache(cacheDir, source)
  }

  const agents = source === 'lobehub'
    ? await fetchLobeHubAgents({
      lobeIndexUrl: opts?.lobeIndexUrl,
      timeoutMs: opts?.timeoutMs,
      retries: opts?.retries,
    })
    : parseAllAgents(await fetchAgencyAgentFiles({
      githubApiBase: opts?.githubApiBase,
      githubRawBase: opts?.githubRawBase,
      timeoutMs: opts?.timeoutMs,
      retries: opts?.retries,
      token: opts?.token,
    }))

  writeCache(cacheDir, agents, source)
  return agents
}

/**
 * Fetch and cache agents from the selected source inventory.
 *
 * - Cache hit (and no --no-cache): returns cached data instantly
 * - Cache miss or --no-cache: fetches from remote, normalizes, caches, and returns
 * - source=all: combines agency-agents and LobeHub cache/source results
 *
 * @returns Array of parsed Agent objects
 */
export async function fetchAgents(
  opts?: FetchOptions
): Promise<Agent[]> {
  const cacheDir = getCacheDir(opts?.cacheDir)
  const source = normalizeSource(opts?.source)

  if (source === 'all') {
    const results = await Promise.allSettled([
      fetchAgentsForSource('agency', cacheDir, opts),
      fetchAgentsForSource('lobehub', cacheDir, opts),
    ])
    const agents = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    if (agents.length > 0) return agents

    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason))
    throw new Error(`All agent sources failed: ${errors.join('; ')}`)
  }

  return fetchAgentsForSource(source, cacheDir, opts)
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
 * Find an agent by exact slug or sourceId match.
 */
export function findAgentBySlug(
  agents: Agent[],
  slug: string
): Agent | undefined {
  return agents.find((a) => a.slug === slug || a.sourceId === slug)
}

/**
 * Find agents by partial slug/sourceId match (case-insensitive substring).
 * Returns all agents whose slug or sourceId contains the query string.
 */
export function findAgentsByPartialSlug(
  agents: Agent[],
  slug: string
): Agent[] {
  const q = slug.toLowerCase()
  return agents.filter((a) =>
    a.slug.toLowerCase().includes(q) ||
    a.sourceId?.toLowerCase().includes(q)
  )
}

/**
 * Search agents by name, description, vibe, tags, source, author, or division (case-insensitive).
 */
export function searchAgents(agents: Agent[], query: string): Agent[] {
  const q = query.toLowerCase()
  return agents.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.vibe.toLowerCase().includes(q) ||
      a.division.toLowerCase().includes(q) ||
      a.source?.toLowerCase().includes(q) ||
      a.author?.toLowerCase().includes(q) ||
      a.tags?.some((tag) => tag.toLowerCase().includes(q))
  )
}
