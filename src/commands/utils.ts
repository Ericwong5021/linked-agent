import chalk from 'chalk'
import type { Agent } from '../data/index.js'

// ─── Division colors ───────────────────────────────────────────────────────────

const DIVISION_COLORS: Record<string, chalk.Chalk> = {
  engineering: chalk.blue,
  design: chalk.magenta,
  marketing: chalk.green,
  sales: chalk.yellow,
  hr: chalk.cyan,
  finance: chalk.red,
  operations: chalk.gray,
  legal: chalk.white,
  product: chalk.hex('#FF6B6B'),
  data: chalk.hex('#4ECDC4'),
}

export function divisionColor(division: string): chalk.Chalk {
  return DIVISION_COLORS[division] ?? chalk.white
}

// ─── String helpers ────────────────────────────────────────────────────────────

/** Strip ANSI escape codes for width measurement */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '')
}

/** Truncate string to maxWidth, appending "…" if clipped */
export function truncate(str: string, maxWidth: number): string {
  const plain = stripAnsi(str)
  if (plain.length <= maxWidth) return str
  return str.slice(0, maxWidth - 1) + '…'
}

/** Pad string (ANSI-aware) to exact width */
export function padEnd(str: string, width: number): string {
  const plain = stripAnsi(str)
  const diff = width - plain.length
  return diff > 0 ? str + ' '.repeat(diff) : str
}

// ─── Table formatting ──────────────────────────────────────────────────────────

interface Column {
  header: string
  width: number
  align?: 'left' | 'right'
  render: (agent: Agent, index: number) => string
}

const SEPARATOR_CHARS = { horizontal: '─', left: '', mid: '  ', right: '' }

function renderSeparator(widths: number[]): string {
  return (
    SEPARATOR_CHARS.left +
    widths.map((w) => SEPARATOR_CHARS.horizontal.repeat(w)).join(SEPARATOR_CHARS.mid) +
    SEPARATOR_CHARS.right
  )
}

export interface TableOptions {
  agents: Agent[]
  totalFiltered: number
  offset: number
  limit: number
  title?: string
}

export function renderTable(opts: TableOptions): string {
  const { agents, totalFiltered, offset, limit, title } = opts

  const columns: Column[] = [
    { header: '#', width: 4, align: 'right', render: (_, i) => String(offset + i + 1) },
    { header: 'Emoji', width: 6, render: (a) => a.emoji },
    {
      header: 'Name',
      width: 32,
      render: (a) => truncate(chalk.cyan.bold(a.name), 32),
    },
    {
      header: 'Division',
      width: 16,
      render: (a) => truncate(divisionColor(a.division)(a.division), 16),
    },
    {
      header: 'Description',
      width: 50,
      render: (a) => truncate(chalk.dim(a.description), 50),
    },
  ]

  const lines: string[] = []

  // Header
  if (title) {
    lines.push(title)
    lines.push('')
  }

  // Column headers
  const headerLine = columns.map((c) => chalk.bold(padEnd(c.header, c.width))).join('  ')
  lines.push(headerLine)
  lines.push(renderSeparator(columns.map((c) => c.width)))

  // Rows
  for (let i = 0; i < agents.length; i++) {
    const row = columns
      .map((c) => {
        const cell = c.render(agents[i], i)
        return padEnd(cell, c.width)
      })
      .join('  ')
    lines.push(row)
  }

  // Pagination footer
  const totalPages = Math.ceil(totalFiltered / limit)
  const currentPage = Math.floor(offset / limit) + 1
  if (totalFiltered > limit) {
    lines.push('')
    lines.push(
      chalk.gray(
        `  Page ${currentPage}/${totalPages} (showing ${agents.length} of ${totalFiltered})  ← Use --offset ${Math.min(offset + limit, totalFiltered)} for next page`
      )
    )
  }

  return lines.join('\n')
}

// ─── JSON output ───────────────────────────────────────────────────────────────

export interface JsonOutput {
  total: number
  filtered: number
  offset: number
  limit: number
  agents: Array<{
    slug: string
    name: string
    emoji: string
    division: string
    description: string
  }>
}

export function buildJsonOutput(
  allAgents: Agent[],
  filteredAgents: Agent[],
  offset: number,
  limit: number
): JsonOutput {
  return {
    total: allAgents.length,
    filtered: filteredAgents.length,
    offset,
    limit,
    agents: filteredAgents.slice(offset, offset + limit).map((a) => ({
      slug: a.slug,
      name: a.name,
      emoji: a.emoji,
      division: a.division,
      description: a.description,
    })),
  }
}
