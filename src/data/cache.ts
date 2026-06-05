import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import type { Agent, AgentSource, CacheMeta } from './types.js'
import { CACHE_TTL_MS, DEFAULT_CACHE_DIR } from './types.js'

/** Expand ~ in path */
function expandHome(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return path.join(os.homedir(), p.slice(2))
  }
  return p
}

/** Get the cache directory path */
export function getCacheDir(customDir?: string): string {
  const dir = customDir ?? DEFAULT_CACHE_DIR
  return expandHome(dir)
}

function cacheSuffix(source: AgentSource = 'agency'): string {
  return source === 'agency' ? '' : `.${source}`
}

export function getCachePaths(cacheDir: string, source: AgentSource = 'agency'): {
  agentsPath: string
  metaPath: string
} {
  const suffix = cacheSuffix(source)
  return {
    agentsPath: path.join(cacheDir, `agents${suffix}.json`),
    metaPath: path.join(cacheDir, `meta${suffix}.json`),
  }
}

export function readCacheMeta(cacheDir: string, source: AgentSource = 'agency'): CacheMeta | undefined {
  const { metaPath } = getCachePaths(cacheDir, source)
  if (!fs.existsSync(metaPath)) return undefined

  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as CacheMeta
  } catch {
    return undefined
  }
}

export function getCacheAgeMs(meta: CacheMeta): number {
  return Date.now() - new Date(meta.fetchedAt).getTime()
}

/** Check if cache is valid (exists and not expired) */
export function isCacheValid(cacheDir: string, source: AgentSource = 'agency'): boolean {
  const { agentsPath } = getCachePaths(cacheDir, source)
  const meta = readCacheMeta(cacheDir, source)

  if (!fs.existsSync(agentsPath) || !meta) {
    return false
  }

  return getCacheAgeMs(meta) < CACHE_TTL_MS
}

/** Read agents from cache */
export function readCache(cacheDir: string, source: AgentSource = 'agency'): Agent[] {
  const { agentsPath } = getCachePaths(cacheDir, source)
  if (!fs.existsSync(agentsPath)) return []
  return JSON.parse(fs.readFileSync(agentsPath, 'utf-8')) as Agent[]
}

/** Write agents and metadata to cache */
export function writeCache(
  cacheDir: string,
  agents: Agent[],
  source: AgentSource = 'agency'
): void {
  fs.mkdirSync(cacheDir, { recursive: true })

  const { agentsPath, metaPath } = getCachePaths(cacheDir, source)

  fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2), 'utf-8')

  const divisions = new Set(agents.map((a) => a.division))
  const meta: CacheMeta = {
    fetchedAt: new Date().toISOString(),
    agentCount: agents.length,
    divisionCount: divisions.size,
    source,
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
}

/** Clear the cache directory */
export function clearCache(cacheDir: string, source?: AgentSource): void {
  if (!source) {
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true })
    }
    return
  }

  const { agentsPath, metaPath } = getCachePaths(cacheDir, source)
  fs.rmSync(agentsPath, { force: true })
  fs.rmSync(metaPath, { force: true })
}
