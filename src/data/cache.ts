import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import type { Agent, CacheMeta } from './types.js'
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

/** Check if cache is valid (exists and not expired) */
export function isCacheValid(cacheDir: string): boolean {
  const agentsPath = path.join(cacheDir, 'agents.json')
  const metaPath = path.join(cacheDir, 'meta.json')

  if (!fs.existsSync(agentsPath) || !fs.existsSync(metaPath)) {
    return false
  }

  try {
    const meta: CacheMeta = JSON.parse(
      fs.readFileSync(metaPath, 'utf-8')
    )
    const age = Date.now() - new Date(meta.fetchedAt).getTime()
    return age < CACHE_TTL_MS
  } catch {
    return false
  }
}

/** Read agents from cache */
export function readCache(cacheDir: string): Agent[] {
  const agentsPath = path.join(cacheDir, 'agents.json')
  if (!fs.existsSync(agentsPath)) return []
  return JSON.parse(fs.readFileSync(agentsPath, 'utf-8'))
}

/** Write agents and metadata to cache */
export function writeCache(
  cacheDir: string,
  agents: Agent[]
): void {
  fs.mkdirSync(cacheDir, { recursive: true })

  const agentsPath = path.join(cacheDir, 'agents.json')
  const metaPath = path.join(cacheDir, 'meta.json')

  fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2), 'utf-8')

  const divisions = new Set(agents.map((a) => a.division))
  const meta: CacheMeta = {
    fetchedAt: new Date().toISOString(),
    agentCount: agents.length,
    divisionCount: divisions.size,
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
}

/** Clear the cache directory */
export function clearCache(cacheDir: string): void {
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true })
  }
}
