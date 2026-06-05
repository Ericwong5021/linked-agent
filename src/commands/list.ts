import { Command } from 'commander'
import chalk from 'chalk'
import { fetchAgents, searchAgents, type Agent } from '../data/index.js'
import { renderTable, buildJsonOutput, divisionColor } from './utils.js'

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all linked agents')
    .option('--cache-dir <path>', 'Custom cache directory')
    .option('--source <name>', 'Agent source: agency, lobehub, or all', 'agency')
    .option('--no-cache', 'Force fresh fetch from remote source')
    .option('-d, --division <name>', 'Filter by division name')
    .option('-s, --search <query>', 'Search agents by name, description, or vibe')
    .option('--sort <field>', 'Sort by field: name (default) or division', 'name')
    .option('--limit <n>', 'Max agents per page', '20')
    .option('--offset <n>', 'Starting position for pagination', '0')
    .option('--json', 'Output as JSON')
    .addHelpText('after', `
Agent examples:
  $ linked-agent list --search reviewer --json
  $ linked-agent list --source lobehub --search designer --limit 5 --json
  $ linked-agent list --division design --limit 5 --json

Tip for AI agents:
  Use --json for inventory scans, then inspect promising slugs with \`linked-agent show <slug> --json\`.
`)
    .action(async (opts) => {
      try {
        const allAgents = await fetchAgents({ noCache: !opts.cache, source: opts.source, cacheDir: opts.cacheDir })

        // Filter by division
        let agents: Agent[] = opts.division
          ? allAgents.filter((a) => a.division === opts.division)
          : allAgents

        // Search (fuzzy match name, description, vibe)
        if (opts.search) {
          agents = searchAgents(agents, opts.search)
        }

        // Sort
        const sortBy = opts.sort === 'division' ? 'division' : 'name'
        agents = [...agents].sort((a, b) => a[sortBy].localeCompare(b[sortBy]))

        // Pagination
        const limit = Math.max(1, parseInt(opts.limit, 10) || 20)
        const offset = Math.max(0, parseInt(opts.offset, 10) || 0)

        // Validate offset
        if (agents.length > 0 && offset >= agents.length) {
          console.log(
            chalk.yellow(
              `Offset ${offset} exceeds total results (${agents.length}). Showing page 1 instead.`
            )
          )
        }

        const pageOffset = offset >= agents.length ? 0 : offset
        const paged = agents.slice(pageOffset, pageOffset + limit)

        // JSON output
        if (opts.json) {
          console.log(JSON.stringify(buildJsonOutput(allAgents, agents, pageOffset, limit), null, 2))
          return
        }

        // Table output
        if (paged.length === 0) {
          console.log(chalk.yellow('No agents found matching your criteria.'))
          return
        }

        // Build title
        const titleParts: string[] = ['🔍 Found']
        titleParts.push(chalk.bold(String(agents.length)))
        titleParts.push(agents.length === 1 ? 'agent' : 'agents')
        if (opts.division) {
          titleParts.push('in')
          titleParts.push(divisionColor(opts.division)(opts.division))
        }
        if (opts.search) {
          titleParts.push(chalk.gray(`matching "${opts.search}"`))
        }

        const table = renderTable({
          agents: paged,
          totalFiltered: agents.length,
          offset: pageOffset,
          limit,
          title: titleParts.join(' '),
        })

        console.log(table)
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`))
        process.exit(1)
      }
    })
}
