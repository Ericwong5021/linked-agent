import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  findAgentBySlug,
  findAgentsByPartialSlug,
  groupByDivision,
  searchAgents,
} from '../.test-dist/data/index.js'

const agents = [
  {
    slug: 'engineering-code-reviewer',
    name: 'Code Reviewer',
    description: 'Reviews pull requests',
    color: '#000',
    emoji: '🧪',
    vibe: 'precise',
    division: 'engineering',
    sections: [],
    rawMarkdown: '',
  },
  {
    slug: 'design-brand-guardian',
    name: 'Brand Guardian',
    description: 'Protects brand systems',
    color: '#fff',
    emoji: '🎨',
    vibe: 'visual',
    division: 'design',
    sections: [],
    rawMarkdown: '',
  },
]

test('findAgentBySlug matches exact slugs only', () => {
  assert.equal(findAgentBySlug(agents, 'engineering-code-reviewer')?.name, 'Code Reviewer')
  assert.equal(findAgentBySlug(agents, 'code-reviewer'), undefined)
})

test('findAgentsByPartialSlug matches slug substrings case-insensitively', () => {
  assert.deepEqual(
    findAgentsByPartialSlug(agents, 'REVIEW').map((agent) => agent.slug),
    ['engineering-code-reviewer']
  )
})

test('searchAgents searches name, description, and vibe', () => {
  assert.deepEqual(searchAgents(agents, 'pull').map((agent) => agent.slug), ['engineering-code-reviewer'])
  assert.deepEqual(searchAgents(agents, 'visual').map((agent) => agent.slug), ['design-brand-guardian'])
})

test('groupByDivision returns alphabetically sorted divisions', () => {
  assert.deepEqual(
    groupByDivision(agents).map((division) => division.name),
    ['design', 'engineering']
  )
})
