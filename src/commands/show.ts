import { Command } from 'commander'
import chalk from 'chalk'
import * as readline from 'readline'
import {
  fetchAgents,
  findAgentBySlug,
  findAgentsByPartialSlug,
} from '../data/index.js'
import type { Agent, AgentSection } from '../data/index.js'

const SEPARATOR = '━'.repeat(70)

/**
 * Format agent details as a human-readable terminal string.
 */
function formatAgentText(agent: Agent): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold(`${agent.emoji} ${agent.name}`))
  lines.push(SEPARATOR)
  lines.push('')
  lines.push(`Source:      ${agent.source ?? 'agency'}${agent.sourceId ? ` (${agent.sourceId})` : ''}`)
  lines.push(`Division:    ${agent.division}`)
  lines.push(`Description: ${agent.description}`)
  lines.push(`Vibe:        ${chalk.dim(agent.vibe)}`)
  lines.push(`Color:       ${agent.color}`)
  if (agent.tags?.length) lines.push(`Tags:        ${agent.tags.join(', ')}`)
  if (agent.sourceUrl) lines.push(`Source URL:  ${agent.sourceUrl}`)
  lines.push('')

  if (agent.services?.length) {
    lines.push(SEPARATOR)
    lines.push('')
    lines.push(chalk.bold('🔧 Services'))
    lines.push('')
    for (const svc of agent.services) {
      lines.push(`  ${svc.name} (${svc.tier ?? 'unknown'}): ${svc.url}`)
    }
    lines.push('')
  }

  if (agent.sections.length > 0) {
    lines.push(SEPARATOR)
    lines.push('')
    for (const sec of agent.sections) {
      const emoji = getSectionEmoji(sec.title)
      const indent = sec.level === 3 ? '  ' : ''
      lines.push(`${indent}${chalk.bold(`${emoji} ${sec.title}`)}`)
      lines.push('')
      lines.push(`${indent}${sec.content.trim()}`)
      lines.push('')
      lines.push(SEPARATOR)
      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * Format agent details as JSON.
 */
function formatAgentJson(agent: Agent): object {
  return {
    slug: agent.slug,
    name: agent.name,
    emoji: agent.emoji,
    color: agent.color,
    vibe: agent.vibe,
    division: agent.division,
    source: agent.source,
    sourceId: agent.sourceId,
    tags: agent.tags ?? [],
    author: agent.author,
    sourceUrl: agent.sourceUrl,
    description: agent.description,
    sections: agent.sections.map((s) => ({
      title: s.title,
      level: s.level,
      content: s.content.trim(),
    })),
    services: agent.services ?? [],
  }
}

/**
 * Return a decorative emoji based on section title keywords.
 */
function getSectionEmoji(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('identity') || t.includes('memory')) return '📋'
  if (t.includes('mission') || t.includes('goal')) return '🎯'
  if (t.includes('metric') || t.includes('success')) return '📊'
  if (t.includes('skill') || t.includes('capability')) return '🛠️'
  if (t.includes('rule') || t.includes('guideline')) return '📐'
  if (t.includes('example')) return '💡'
  return '📄'
}

/**
 * Prompt the user to pick from a list of candidates.
 * Returns the chosen agent or undefined if the user declines.
 */
async function promptCandidateSelection(
  candidates: Agent[]
): Promise<Agent | undefined> {
  console.log(chalk.yellow(`\nDid you mean one of these?`))
  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i]
    console.log(`  ${chalk.cyan(`${i + 1}.`)} ${a.emoji} ${chalk.bold(a.name)} ${chalk.gray(`(${a.slug})`)}`)
  }
  console.log(`  ${chalk.gray('0. Cancel')}`)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  })

  return new Promise((resolve) => {
    rl.question(chalk.cyan('\nPick a number: '), (answer) => {
      rl.close()
      const num = parseInt(answer, 10)
      if (num >= 1 && num <= candidates.length) {
        resolve(candidates[num - 1])
      } else {
        resolve(undefined)
      }
    })
  })
}

/**
 * Filter sections by a query string (case-insensitive substring match on title).
 */
function filterSections(
  sections: AgentSection[],
  query: string
): AgentSection[] {
  const q = query.toLowerCase()
  return sections.filter((s) => s.title.toLowerCase().includes(q))
}

export function registerShowCommand(program: Command): void {
  program
    .command('show')
    .description('Show details of a linked agent')
    .argument('<slug>', 'Agent slug to show (e.g. engineering-code-reviewer)')
    .option('--cache-dir <path>', 'Custom cache directory')
    .option('--source <name>', 'Agent source: agency, lobehub, or all', 'all')
    .option('--no-cache', 'Force fresh fetch from remote source')
    .option('--json', 'Output as JSON')
    .option('--section <title>', 'Only show sections matching title (substring)')
    .addHelpText('after', `
Agent examples:
  $ linked-agent show lobehub/frontend-development-expert --json
  $ linked-agent show engineering-code-reviewer --json
  $ linked-agent show engineering-code-reviewer --section mission

Tip for AI agents:
  Use --json to compare mission, capabilities, rules, services, and vibe programmatically.
`)
    .action(async (slug: string, opts) => {
      try {
        const agents = await fetchAgents({ noCache: !opts.cache, source: opts.source, cacheDir: opts.cacheDir })

        // 1. Exact match
        let agent = findAgentBySlug(agents, slug)

        // 2. Partial / fuzzy match
        if (!agent) {
          const candidates = findAgentsByPartialSlug(agents, slug)

          if (candidates.length === 1) {
            agent = candidates[0]
          } else if (candidates.length > 1) {
            if (opts.json) {
              // JSON mode: return the candidate list directly
              console.log(
                JSON.stringify(
                  candidates.map((a) => ({
                    slug: a.slug,
                    name: a.name,
                    emoji: a.emoji,
                    division: a.division,
                    source: a.source,
                    sourceId: a.sourceId,
                  })),
                  null,
                  2
                )
              )
              return
            }
            // Interactive: prompt user to pick
            agent = await promptCandidateSelection(candidates)
          }
        }

        // 3. No match at all
        if (!agent) {
          if (opts.json) {
            console.log(JSON.stringify({ error: `No agent found with slug "${slug}"` }))
          } else {
            console.error(chalk.red(`No agent found with slug "${slug}"`))
            console.log(chalk.gray('Use "linked-agent list" to see available agents'))
          }
          process.exit(1)
        }

        // 4. Apply --section filter
        if (opts.section) {
          agent = {
            ...agent,
            sections: filterSections(agent.sections, opts.section),
          }
        }

        // 5. Output
        if (opts.json) {
          console.log(JSON.stringify(formatAgentJson(agent), null, 2))
        } else {
          console.log(formatAgentText(agent))
        }
      } catch (error) {
        if (opts.json) {
          console.log(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            })
          )
        } else {
          console.error(
            chalk.red(`Error: ${error instanceof Error ? error.message : error}`)
          )
        }
        process.exit(1)
      }
    })
}
