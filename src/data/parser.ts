import matter from 'gray-matter'
import type { Agent, AgentSection, Service } from './types.js'

/** Extract ## and ### sections from markdown (after frontmatter) */
function extractSections(markdown: string): AgentSection[] {
  // Remove frontmatter
  const body = markdown.replace(/^---[\s\S]*?---\s*\n?/, '')
  const sections: AgentSection[] = []
  const lines = body.split('\n')
  let current: AgentSection | null = null

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/)
    const h3 = line.match(/^### (.+)$/)

    if (h2 || h3) {
      if (current) sections.push(current)
      current = {
        title: (h2 ? h2[1] : h3![1]).trim(),
        level: h2 ? 2 : 3,
        content: '',
      }
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line
    }
  }

  if (current) sections.push(current)
  return sections
}

/** Slug from filename: "engineering-code-reviewer.md" → "engineering-code-reviewer" */
export function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '')
}

/** Division from path: "engineering/agent.md" → "engineering" */
export function divisionFromPath(path: string): string {
  const parts = path.split('/')
  return parts.length > 1 ? parts[0] : 'unknown'
}

/** Parse a single agent markdown file into an Agent object */
export function parseAgent(
  markdown: string,
  filename: string,
  divisionPath: string
): Agent {
  const slug = slugFromFilename(filename)
  const division = divisionFromPath(divisionPath)

  let data: Record<string, unknown> = {}
  try {
    const parsed = matter(markdown)
    data = parsed.data as Record<string, unknown>
  } catch {
    // Fallback: no frontmatter or parse error
  }

  return {
    slug,
    name: String(data.name ?? slug),
    description: String(data.description ?? ''),
    color: String(data.color ?? '#888888'),
    emoji: String(data.emoji ?? ''),
    vibe: String(data.vibe ?? ''),
    division,
    services: Array.isArray(data.services)
      ? (data.services as Service[])
      : undefined,
    sections: extractSections(markdown),
    rawMarkdown: markdown,
    source: 'agency',
  }
}

/** Parse all agent files and group by division */
export function parseAllAgents(
  files: Array<{ path: string; content: string }>
): Agent[] {
  return files.map((f) => parseAgent(f.content, basename(f.path), f.path))
}

function basename(path: string): string {
  return path.split('/').pop() ?? path
}
