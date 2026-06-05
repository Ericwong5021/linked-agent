import { Command } from 'commander'
import chalk from 'chalk'
import { fetchAgents, searchAgents } from '../data/index.js'

export function registerSearchCommand(program: Command): void {
  program
    .command('search')
    .description('Search for linked agents by name, description, or vibe')
    .argument('<query>', 'Search query')
    .option('--no-cache', 'Force fresh fetch from GitHub')
    .action(async (query: string, opts) => {
      try {
        const agents = await fetchAgents({ noCache: !opts.cache })
        const results = searchAgents(agents, query)

        if (results.length === 0) {
          console.log(chalk.yellow(`No agents found matching "${query}"`))
          return
        }

        console.log(chalk.bold(`\n🔍 Search results for "${query}":`))
        for (const agent of results) {
          console.log(`\n  ${agent.emoji} ${chalk.cyan(agent.name)} (${chalk.gray(agent.division)})`)
          console.log(`    ${agent.description}`)
        }

        console.log(chalk.gray(`\n${results.length} agents found`))
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`))
        process.exit(1)
      }
    })
}
