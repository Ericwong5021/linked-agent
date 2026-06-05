import { Command } from 'commander'
import chalk from 'chalk'
import { CACHE_TTL_MS } from '../data/types.js'
import {
  clearCache,
  getCacheAgeMs,
  getCacheDir,
  getCachePaths,
  isCacheValid,
  readCacheMeta,
} from '../data/cache.js'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`

  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`

  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

export function registerCacheCommand(program: Command): void {
  const cache = program
    .command('cache')
    .description('Manage the local linked-agent cache')
    .option('--cache-dir <path>', 'Custom cache directory')
    .option('--source <name>', 'Cache source: agency or lobehub', 'agency')

  cache
    .command('status')
    .description('Show local cache status')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      const parentOpts = cache.opts<{ cacheDir?: string; source?: 'agency' | 'lobehub' }>()
      const source = parentOpts.source ?? 'agency'
      const cacheDir = getCacheDir(parentOpts.cacheDir)
      const meta = readCacheMeta(cacheDir, source)
      const paths = getCachePaths(cacheDir, source)
      const valid = isCacheValid(cacheDir, source)
      const ageMs = meta ? getCacheAgeMs(meta) : undefined
      const expiresInMs = ageMs === undefined ? undefined : Math.max(0, CACHE_TTL_MS - ageMs)

      if (opts.json) {
        console.log(
          JSON.stringify(
            {
              cacheDir,
              source,
              agentsPath: paths.agentsPath,
              metaPath: paths.metaPath,
              exists: Boolean(meta),
              valid,
              ttlMs: CACHE_TTL_MS,
              ageMs,
              expiresInMs,
              meta,
            },
            null,
            2
          )
        )
        return
      }

      console.log(chalk.bold('\n📦 Cache status'))
      console.log(`Directory: ${cacheDir}`)
      console.log(`Source:    ${source}`)

      if (!meta) {
        console.log(chalk.yellow('Status:    empty or unreadable'))
        console.log(chalk.gray(`Run "linked-agent list --source ${source}" to populate the cache.`))
        return
      }

      console.log(`Status:    ${valid ? chalk.green('valid') : chalk.yellow('expired')}`)
      console.log(`Fetched:   ${meta.fetchedAt}`)
      console.log(`Age:       ${formatDuration(ageMs ?? 0)}`)
      console.log(`Expires:   ${formatDuration(expiresInMs ?? 0)}`)
      console.log(`Agents:    ${meta.agentCount}`)
      console.log(`Divisions: ${meta.divisionCount}`)
    })

  cache
    .command('clear')
    .description('Delete local cache files for the selected source')
    .option('--all', 'Delete the entire cache directory for every source')
    .action((opts) => {
      const parentOpts = cache.opts<{ cacheDir?: string; source?: 'agency' | 'lobehub' }>()
      const source = parentOpts.source ?? 'agency'
      const cacheDir = getCacheDir(parentOpts.cacheDir)

      if (opts.all) {
        clearCache(cacheDir)
        console.log(chalk.green(`Cleared all caches at ${cacheDir}`))
        return
      }

      clearCache(cacheDir, source)
      console.log(chalk.green(`Cleared ${source} cache at ${cacheDir}`))
    })
}
