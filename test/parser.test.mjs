import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  divisionFromPath,
  parseAgent,
  parseAllAgents,
  slugFromFilename,
} from '../.test-dist/data/parser.js'

const markdown = `---
name: Code Reviewer
description: Reviews pull requests
color: '#3366ff'
emoji: 🧪
vibe: precise and helpful
services:
  - name: Review API
    url: https://example.com/review
    tier: pro
---

Intro paragraph that should not become a section.

## Identity
Keeps review context.

### Rules
- Be specific
- Cite files
`

test('slugFromFilename removes the markdown extension', () => {
  assert.equal(slugFromFilename('engineering-code-reviewer.md'), 'engineering-code-reviewer')
})

test('divisionFromPath extracts the top-level division', () => {
  assert.equal(divisionFromPath('engineering/code-reviewer.md'), 'engineering')
  assert.equal(divisionFromPath('standalone.md'), 'unknown')
})

test('parseAgent reads frontmatter and markdown sections', () => {
  const agent = parseAgent(markdown, 'code-reviewer.md', 'engineering/code-reviewer.md')

  assert.equal(agent.slug, 'code-reviewer')
  assert.equal(agent.name, 'Code Reviewer')
  assert.equal(agent.description, 'Reviews pull requests')
  assert.equal(agent.color, '#3366ff')
  assert.equal(agent.emoji, '🧪')
  assert.equal(agent.vibe, 'precise and helpful')
  assert.equal(agent.division, 'engineering')
  assert.deepEqual(agent.services, [
    {
      name: 'Review API',
      url: 'https://example.com/review',
      tier: 'pro',
    },
  ])
  assert.deepEqual(
    agent.sections.map((section) => ({ title: section.title, level: section.level })),
    [
      { title: 'Identity', level: 2 },
      { title: 'Rules', level: 3 },
    ]
  )
})

test('parseAllAgents parses each fetched file', () => {
  const agents = parseAllAgents([
    { path: 'engineering/code-reviewer.md', content: markdown },
    { path: 'design/visual-designer.md', content: '---\nname: Visual Designer\n---\n' },
  ])

  assert.equal(agents.length, 2)
  assert.equal(agents[0].division, 'engineering')
  assert.equal(agents[1].division, 'design')
})
