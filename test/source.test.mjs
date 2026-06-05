import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { getCachePaths } from '../.test-dist/data/cache.js'
import { fetchAgents, findAgentBySlug, searchAgents } from '../.test-dist/data/index.js'

function dataUrl(payload) {
  return `data:application/json,${encodeURIComponent(JSON.stringify(payload))}`
}

test('getCachePaths keeps agency cache compatible and separates lobehub cache files', () => {
  assert.deepEqual(getCachePaths('/tmp/cache'), {
    agentsPath: join('/tmp/cache', 'agents.json'),
    metaPath: join('/tmp/cache', 'meta.json'),
  })
  assert.deepEqual(getCachePaths('/tmp/cache', 'lobehub'), {
    agentsPath: join('/tmp/cache', 'agents.lobehub.json'),
    metaPath: join('/tmp/cache', 'meta.lobehub.json'),
  })
})

test('fetchAgents normalizes LobeHub index entries without bundling the marketplace', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'linked-agent-source-'))
  const payload = {
    agents: [
      {
        identifier: 'frontend-development-expert',
        author: 'LobeHub',
        homepage: 'https://lobehub.com/agent/frontend-development-expert',
        meta: {
          title: 'Frontend Development Expert',
          description: 'Vue 3 + TypeScript frontend expert',
          avatar: '💻',
          category: 'Programming',
          tags: ['frontend', 'typescript', 'vue'],
        },
        config: {
          systemRole: 'Provide runnable frontend code and architecture suggestions.',
        },
      },
    ],
  }

  try {
    const agents = await fetchAgents({
      source: 'lobehub',
      cacheDir: dir,
      noCache: true,
      lobeIndexUrl: dataUrl(payload),
    })

    assert.equal(agents.length, 1)
    assert.equal(agents[0].slug, 'lobehub/frontend-development-expert')
    assert.equal(agents[0].source, 'lobehub')
    assert.equal(agents[0].division, 'programming')
    assert.deepEqual(agents[0].tags, ['frontend', 'typescript', 'vue'])
    assert.equal(findAgentBySlug(agents, 'frontend-development-expert')?.name, 'Frontend Development Expert')
    assert.equal(searchAgents(agents, 'typescript').length, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('clearCache can remove one source without deleting the other source cache', async () => {
  const { writeCache, readCache, clearCache } = await import('../.test-dist/data/cache.js')
  const dir = mkdtempSync(join(tmpdir(), 'linked-agent-source-clear-'))
  const baseAgent = {
    slug: 'one',
    name: 'One',
    description: '',
    color: '#000',
    emoji: '🤖',
    vibe: '',
    division: 'general',
    sections: [],
    rawMarkdown: '',
  }

  try {
    writeCache(dir, [{ ...baseAgent, source: 'agency' }], 'agency')
    writeCache(dir, [{ ...baseAgent, slug: 'two', source: 'lobehub' }], 'lobehub')

    clearCache(dir, 'lobehub')

    assert.equal(readCache(dir, 'agency').length, 1)
    assert.equal(readCache(dir, 'lobehub').length, 0)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
