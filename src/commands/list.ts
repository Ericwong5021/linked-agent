import { Command } from 'commander'
import chalk from 'chalk'
import { fetchAgents, groupByDivision } from '../data/index.js'

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List linked agents')
    .option('--no-cache', 'Force fresh fetch from GitHub')
    .option('--division <name>', 'Filter by division name')
    .action(async (opts) => {
      try {
        const agents = await fetchAgents({ noCache: !opts.cache })
        const divisions = groupByDivision(agents)

        const filtered = opts.division
          ? divisions.filter((d) => d.name === opts.division)
          : divisions

        for (const div of filtered) {
          console.log(chalk.bold(`\n📦 ${div.name}`))
          for (const agent of div.agents) {
            console.log(`  ${agent.emoji} ${chalk.cyan(agent.name)} — ${agent.description}`)
          }
        }

        console.log(chalk.gray(`\n${agents.length} agents in ${filtered.length} divisions`))
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`))
        process.exit(1)
      }
    })
}
