import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  clearCache,
  getCachePaths,
  isCacheValid,
  readCache,
  readCacheMeta,
  writeCache,
} from '../.test-dist/data/cache.js'

function sampleAgent(slug) {
  return {
    slug,
    name: 'Sample Agent',
    description: 'Sample description',
    color: '#000000',
    emoji: '🤖',
    vibe: 'steady',
    division: 'engineering',
    sections: [],
    rawMarkdown: '',
  }
}

test('writeCache stores agents and metadata that can be read back', () => {
  const dir = mkdtempSync(join(tmpdir(), 'linked-agent-cache-'))

  try {
    const agents = [sampleAgent('one'), sampleAgent('two')]
    writeCache(dir, agents)

    assert.deepEqual(readCache(dir), agents)
    assert.equal(isCacheValid(dir), true)

    const meta = readCacheMeta(dir)
    assert.equal(meta.agentCount, 2)
    assert.equal(meta.divisionCount, 1)
    assert.match(meta.fetchedAt, /^\d{4}-\d{2}-\d{2}T/)

    const paths = getCachePaths(dir)
    assert.equal(paths.agentsPath, join(dir, 'agents.json'))
    assert.equal(paths.metaPath, join(dir, 'meta.json'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('clearCache removes the cache directory safely', () => {
  const dir = mkdtempSync(join(tmpdir(), 'linked-agent-cache-'))

  writeCache(dir, [sampleAgent('one')])
  clearCache(dir)

  assert.equal(isCacheValid(dir), false)
  assert.deepEqual(readCache(dir), [])
})
