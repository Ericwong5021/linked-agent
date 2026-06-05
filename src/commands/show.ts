import { Command } from 'commander'
import chalk from 'chalk'
import { fetchAgents, findAgentBySlug } from '../data/index.js'

export function registerShowCommand(program: Command): void {
  program
    .command('show')
    .description('Show details of a linked agent')
    .argument('<slug>', 'Agent slug to show (e.g. engineering-code-reviewer)')
    .option('--no-cache', 'Force fresh fetch from GitHub')
    .action(async (slug: string, opts) => {
      try {
        const agents = await fetchAgents({ noCache: !opts.cache })
        const agent = findAgentBySlug(agents, slug)

        if (!agent) {
          console.error(chalk.red(`Agent "${slug}" not found`))
          console.log(chalk.gray('Use "linked-agent list" to see available agents'))
          process.exit(1)
        }

        console.log(chalk.bold(`\n${agent.emoji} ${agent.name}`))
        console.log(chalk.gray(`Division: ${agent.division} | Slug: ${agent.slug}`))
        console.log(`\n${agent.description}`)
        console.log(chalk.dim(`Vibe: ${agent.vibe}`))

        if (agent.services?.length) {
          console.log(chalk.bold('\nServices:'))
          for (const svc of agent.services) {
            console.log(`  ${svc.name} (${svc.tier ?? 'unknown'}): ${svc.url}`)
          }
        }

        if (agent.sections.length > 0) {
          console.log(chalk.bold('\nSections:'))
          for (const sec of agent.sections) {
            const indent = sec.level === 3 ? '  ' : ''
            console.log(`\n${indent}${chalk.bold(sec.title)}`)
            console.log(`${indent}${sec.content.trim()}`)
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`))
        process.exit(1)
      }
    })
}
