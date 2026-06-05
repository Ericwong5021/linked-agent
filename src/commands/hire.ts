import { Command } from 'commander'
import chalk from 'chalk'
import { fetchAgents } from '../data/index.js'
import { recommendAgentsForHire } from '../data/matcher.js'

function parseSkills(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
}

function formatHumanOutput(opts: {
  role: string
  goal?: string
  skills: string[]
  recommendations: ReturnType<typeof recommendAgentsForHire>
}): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold(`🧑‍💼 Hiring brief: ${opts.role}`))
  if (opts.goal) lines.push(`Goal:   ${opts.goal}`)
  if (opts.skills.length > 0) lines.push(`Skills: ${opts.skills.join(', ')}`)
  lines.push('')

  if (opts.recommendations.length === 0) {
    lines.push(chalk.yellow('No matching agent personas found.'))
    lines.push(chalk.gray('Try a broader role, add English keywords, or run `linked-agent list --json` for full inventory.'))
    return lines.join('\n')
  }

  lines.push(chalk.bold(`Top ${opts.recommendations.length} recommended personas`))
  lines.push('')

  for (let index = 0; index < opts.recommendations.length; index++) {
    const recommendation = opts.recommendations[index]
    const { agent } = recommendation
    lines.push(`${chalk.cyan(`${index + 1}.`)} ${agent.emoji} ${chalk.bold(agent.name)} ${chalk.gray(`(${agent.slug})`)}`)
    lines.push(`   Division: ${agent.division}  Score: ${recommendation.score}`)
    for (const reason of recommendation.rationale.slice(0, 3)) {
      lines.push(`   - ${reason}`)
    }
    lines.push(`   Next: ${recommendation.nextCommands[0]}`)
    lines.push('')
  }

  lines.push(chalk.gray('Agent workflow tip: inspect 2-3 candidates with `show`, then choose the persona whose mission/rules fit the hiring task.'))
  return lines.join('\n')
}

function formatAgentPlaybook(role: string): string {
  return [
    `You are an HR agent hiring for: ${role}`,
    '',
    'Use linked-agent as your talent/persona library:',
    `1. Run: linked-agent hire "${role}" --json`,
    '2. Read candidates[].rationale and candidates[].nextCommands.',
    '3. Run `linked-agent show <slug> --json` for the top 2-3 personas.',
    '4. Compare mission, capabilities, rules, services, and vibe.',
    '5. Return a short hiring recommendation with selected persona slug and why.',
  ].join('\n')
}

export function registerHireCommand(program: Command): void {
  program
    .command('hire')
    .alias('recommend')
    .description('Recommend agent personas for a role or hiring brief')
    .argument('<role>', 'Role to hire for, e.g. "frontend designer" or "前端设计师"')
    .option('--source <name>', 'Agent source: agency, lobehub, or all', 'all')
    .option('--goal <text>', 'Hiring goal or task context')
    .option('--skills <list>', 'Comma-separated desired skills, e.g. "React,Figma,UI"')
    .option('-d, --division <name>', 'Restrict candidates to a division')
    .option('--limit <n>', 'Number of recommendations to return', '5')
    .option('--cache-dir <path>', 'Custom cache directory for agent inventory')
    .option('--no-cache', 'Force fresh fetch from remote source')
    .option('--json', 'Output agent-friendly JSON')
    .option('--playbook', 'Print a short workflow prompt for another AI agent')
    .addHelpText('after', `
Examples:
  $ linked-agent hire "前端设计师" --goal "为招聘流程找到合适的人设" --skills "React,Figma,UI"
  $ linked-agent hire "frontend designer" --source lobehub --json --limit 3
  $ linked-agent hire "HR recruiter" --division hr --playbook
  $ linked-agent hire "frontend designer" --cache-dir ~/.linked-agent/cache --json

Agent workflow:
  1. Use --json when another agent will parse the result.
  2. Inspect candidates with: linked-agent show <slug> --json
  3. Choose the persona whose mission, skills, rules, and vibe fit the task.
`)
    .action(async (role: string, opts) => {
      if (opts.playbook) {
        console.log(formatAgentPlaybook(role))
        return
      }

      try {
        const skills = parseSkills(opts.skills)
        const limit = Math.max(1, parseInt(opts.limit, 10) || 5)
        const agents = await fetchAgents({ noCache: !opts.cache, cacheDir: opts.cacheDir, source: opts.source })
        const recommendations = recommendAgentsForHire(
          agents,
          {
            role,
            goal: opts.goal,
            skills,
            division: opts.division,
          },
          limit
        )

        if (opts.json) {
          console.log(JSON.stringify({
            role,
            goal: opts.goal,
            skills,
            division: opts.division,
            totalCandidates: recommendations.length,
            candidates: recommendations.map((recommendation) => ({
              slug: recommendation.agent.slug,
              name: recommendation.agent.name,
              emoji: recommendation.agent.emoji,
              division: recommendation.agent.division,
              source: recommendation.agent.source,
              sourceId: recommendation.agent.sourceId,
              sourceUrl: recommendation.agent.sourceUrl,
              tags: recommendation.agent.tags,
              description: recommendation.agent.description,
              score: recommendation.score,
              matchedTerms: recommendation.matchedTerms,
              rationale: recommendation.rationale,
              nextCommands: recommendation.nextCommands,
            })),
            agentInstructions: [
              'Use nextCommands to inspect promising candidates.',
              'Prefer candidates whose mission/rules match the hiring task, not only the highest score.',
              'Return the selected persona slug and a concise rationale.',
            ],
          }, null, 2))
          return
        }

        console.log(formatHumanOutput({ role, goal: opts.goal, skills, recommendations }))
      } catch (error) {
        if (opts.json) {
          console.log(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        } else {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`))
        }
        process.exit(1)
      }
    })
}
