import type { Agent } from './types.js'

export interface HireSearchInput {
  role: string
  goal?: string
  skills?: string[]
  division?: string
}

export interface HireRecommendation {
  agent: Agent
  score: number
  matchedTerms: string[]
  rationale: string[]
  nextCommands: string[]
}

const ROLE_SYNONYMS: Array<{ patterns: string[]; terms: string[]; divisions?: string[] }> = [
  {
    patterns: ['前端', 'frontend', 'front-end', 'web'],
    terms: ['frontend', 'front-end', 'web', 'react', 'typescript', 'javascript', 'ui', 'interface'],
    divisions: ['engineering', 'product'],
  },
  {
    patterns: ['设计', 'designer', 'design', 'ui', 'ux', '视觉', '交互'],
    terms: ['design', 'designer', 'ui', 'ux', 'visual', 'interface', 'figma', 'prototype', 'brand'],
    divisions: ['design', 'product'],
  },
  {
    patterns: ['产品', 'product', 'pm'],
    terms: ['product', 'roadmap', 'requirement', 'user', 'market', 'strategy'],
    divisions: ['product'],
  },
  {
    patterns: ['招聘', 'hr', 'human resources', 'recruit', 'hiring', 'talent'],
    terms: ['hr', 'recruit', 'hiring', 'talent', 'interview', 'candidate', 'people'],
    divisions: ['hr', 'operations'],
  },
  {
    patterns: ['营销', 'marketing', 'growth', '增长'],
    terms: ['marketing', 'growth', 'campaign', 'content', 'brand', 'seo'],
    divisions: ['marketing'],
  },
  {
    patterns: ['销售', 'sales', 'bd', '商务'],
    terms: ['sales', 'business development', 'lead', 'pipeline', 'customer'],
    divisions: ['sales'],
  },
]

function normalize(input: string): string {
  return input.toLowerCase().replace(/[,_/|]+/g, ' ')
}

function splitTerms(input: string): string[] {
  return normalize(input)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

export function expandHireTerms(input: HireSearchInput): string[] {
  const source = [input.role, input.goal, ...(input.skills ?? [])]
    .filter(Boolean)
    .join(' ')
  const normalizedSource = normalize(source)
  const terms = splitTerms(source)

  for (const group of ROLE_SYNONYMS) {
    if (group.patterns.some((pattern) => normalizedSource.includes(normalize(pattern)))) {
      terms.push(...group.terms)
      terms.push(...(group.divisions ?? []))
    }
  }

  return unique(terms)
}

function agentText(agent: Agent): string {
  const services = agent.services
    ?.map((service) => `${service.name} ${service.tier ?? ''} ${service.url}`)
    .join(' ') ?? ''
  const sections = agent.sections
    .map((section) => `${section.title} ${section.content}`)
    .join(' ')

  return normalize([
    agent.slug,
    agent.name,
    agent.description,
    agent.vibe,
    agent.division,
    services,
    sections,
  ].join(' '))
}

function scoreTerm(text: string, term: string): number {
  const normalized = normalize(term)
  if (!normalized) return 0
  if (text.includes(normalized)) return normalized.includes(' ') ? 8 : 4
  return 0
}

function divisionBoost(agent: Agent, input: HireSearchInput): number {
  const normalizedRole = normalize([input.role, input.goal, ...(input.skills ?? [])].join(' '))
  let score = 0

  for (const group of ROLE_SYNONYMS) {
    const roleMatches = group.patterns.some((pattern) => normalizedRole.includes(normalize(pattern)))
    const divisionMatches = group.divisions?.includes(agent.division)
    if (roleMatches && divisionMatches) score += 12
  }

  if (input.division && agent.division === input.division) score += 20
  return score
}

function buildRationale(agent: Agent, input: HireSearchInput, matchedTerms: string[]): string[] {
  const reasons: string[] = []

  if (input.division && agent.division === input.division) {
    reasons.push(`division matches requested "${input.division}"`)
  }

  const normalizedRole = normalize([input.role, input.goal, ...(input.skills ?? [])].join(' '))
  for (const group of ROLE_SYNONYMS) {
    const roleMatches = group.patterns.some((pattern) => normalizedRole.includes(normalize(pattern)))
    if (roleMatches && group.divisions?.includes(agent.division)) {
      reasons.push(`division "${agent.division}" is relevant to ${input.role}`)
    }
  }

  if (matchedTerms.length > 0) {
    reasons.push(`matched terms: ${matchedTerms.slice(0, 8).join(', ')}`)
  }

  if (agent.description) {
    reasons.push(agent.description)
  }

  return unique(reasons).slice(0, 4)
}

export function recommendAgentsForHire(
  agents: Agent[],
  input: HireSearchInput,
  limit = 5
): HireRecommendation[] {
  const terms = expandHireTerms(input)

  return agents
    .filter((agent) => !input.division || agent.division === input.division)
    .map((agent) => {
      const text = agentText(agent)
      const matchedTerms = terms.filter((term) => scoreTerm(text, term) > 0)
      const score = matchedTerms.reduce((sum, term) => sum + scoreTerm(text, term), 0) + divisionBoost(agent, input)

      return {
        agent,
        score,
        matchedTerms,
        rationale: buildRationale(agent, input, matchedTerms),
        nextCommands: [
          `linked-agent show ${agent.slug}`,
          `linked-agent show ${agent.slug} --json`,
        ],
      }
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name))
    .slice(0, Math.max(1, limit))
}
