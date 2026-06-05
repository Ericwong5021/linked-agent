import assert from 'node:assert/strict'
import { test } from 'node:test'
import { expandHireTerms, recommendAgentsForHire } from '../.test-dist/data/matcher.js'

const agents = [
  {
    slug: 'design-ui-specialist',
    name: 'UI Specialist',
    description: 'Designs user interfaces and visual systems with Figma',
    color: '#fff',
    emoji: '🎨',
    vibe: 'visual and structured',
    division: 'design',
    sections: [
      { title: 'Mission', level: 2, content: 'Create interface prototypes and UX flows.' },
    ],
    rawMarkdown: '',
  },
  {
    slug: 'engineering-api-builder',
    name: 'API Builder',
    description: 'Builds backend services and APIs',
    color: '#000',
    emoji: '🛠️',
    vibe: 'reliable',
    division: 'engineering',
    sections: [],
    rawMarkdown: '',
  },
]

test('expandHireTerms adds role synonyms for Chinese frontend designer briefs', () => {
  const terms = expandHireTerms({ role: '前端设计师', skills: ['React', 'Figma'] })

  assert.equal(terms.includes('frontend'), true)
  assert.equal(terms.includes('design'), true)
  assert.equal(terms.includes('figma'), true)
})

test('recommendAgentsForHire ranks relevant personas and returns agent next commands', () => {
  const [recommendation] = recommendAgentsForHire(
    agents,
    { role: '前端设计师', skills: ['Figma', 'UI'] },
    1
  )

  assert.equal(recommendation.agent.slug, 'design-ui-specialist')
  assert.equal(recommendation.matchedTerms.includes('figma'), true)
  assert.deepEqual(recommendation.nextCommands, [
    'linked-agent show design-ui-specialist',
    'linked-agent show design-ui-specialist --json',
  ])
})

test('recommendAgentsForHire respects explicit division filters', () => {
  const [recommendation] = recommendAgentsForHire(
    agents,
    { role: 'frontend developer', division: 'engineering' },
    3
  )

  assert.equal(recommendation.agent.slug, 'engineering-api-builder')
})
