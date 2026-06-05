import { GITHUB_API_BASE, GITHUB_RAW_BASE } from './types.js'

const REPO_OWNER = 'msitarzewski'
const REPO_NAME = 'agency-agents'
const BRANCH = 'main'
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_RETRIES = 2

interface RequestOptions {
  timeoutMs?: number
  retries?: number
  token?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getGitHubToken(explicitToken?: string): string | undefined {
  return explicitToken ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
}

function buildHeaders(accept?: string, token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'linked-agent-cli',
  }

  if (accept) headers.Accept = accept

  const githubToken = getGitHubToken(token)
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`

  return headers
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

function formatNetworkError(error: unknown, url: string): string {
  if (error instanceof Error) {
    const cause = error.cause as { code?: string; hostname?: string } | undefined
    if (cause?.code === 'EAI_AGAIN' || cause?.code === 'ENOTFOUND') {
      return `Network DNS error while reaching ${cause.hostname ?? new URL(url).hostname}. Check your internet or DNS configuration.`
    }
    if (error.name === 'AbortError') {
      return `Request timed out while reaching ${new URL(url).hostname}. Try again or increase network reliability.`
    }
    return error.message
  }
  return String(error)
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts?: RequestOptions
): Promise<Response> {
  const retries = opts?.retries ?? DEFAULT_RETRIES
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (!isRetryableStatus(response.status) || attempt === retries) {
        return response
      }

      await response.body?.cancel()
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error
      if (attempt === retries) {
        throw new Error(formatNetworkError(error, url), { cause: error })
      }
    } finally {
      clearTimeout(timer)
    }

    await sleep(250 * 2 ** attempt)
  }

  throw new Error(formatNetworkError(lastError, url), { cause: lastError })
}

async function fetchJson<T>(
  url: string,
  opts?: RequestOptions
): Promise<{ response: Response; data: T }> {
  const response = await fetchWithRetry(
    url,
    {
      headers: buildHeaders('application/vnd.github.v3+json', opts?.token),
    },
    opts
  )
  const data = (await response.json()) as T
  return { response, data }
}

async function fetchText(
  url: string,
  opts?: RequestOptions
): Promise<{ response: Response; text: string }> {
  const response = await fetchWithRetry(
    url,
    {
      headers: buildHeaders(undefined, opts?.token),
    },
    opts
  )
  const text = await response.text()
  return { response, text }
}

/**
 * Fetch directory listing from GitHub contents API.
 * Returns paths of .md files in the given directory.
 */
async function listMdFiles(
  dirPath: string,
  apiBase: string,
  opts?: RequestOptions
): Promise<string[]> {
  const url = `${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dirPath}?ref=${BRANCH}`
  const { response, data } = await fetchJson<Array<{ name: string; type: string; path: string }>>(url, opts)

  if (!response.ok) {
    throw new Error(
      `GitHub API error ${response.status}: ${response.statusText} (path: ${dirPath})`
    )
  }

  return data
    .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
    .map((item) => item.path)
}

/**
 * Fetch file content via raw.githubusercontent.com for speed.
 */
async function fetchRawContent(
  filePath: string,
  rawBase: string,
  opts?: RequestOptions
): Promise<string> {
  const url = `${rawBase}/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`
  const { response, text } = await fetchText(url, opts)

  if (!response.ok) {
    throw new Error(
      `GitHub Raw error ${response.status}: ${response.statusText} (file: ${filePath})`
    )
  }

  return text
}

/**
 * Fetch all division directories at repo root level.
 * Returns directory names (e.g. ["engineering", "design", ...]).
 */
async function listDivisions(apiBase: string, opts?: RequestOptions): Promise<string[]> {
  const url = `${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/?ref=${BRANCH}`
  const { response, data } = await fetchJson<Array<{ name: string; type: string }>>(url, opts)

  if (!response.ok) {
    throw new Error(
      `GitHub API error ${response.status}: ${response.statusText} (path: /)`
    )
  }

  return data
    .filter((item) => item.type === 'dir' && !item.name.startsWith('.'))
    .map((item) => item.name)
}

export interface FetchedFile {
  path: string
  content: string
}

/**
 * Fetch all agent markdown files from the agency-agents repo.
 * Strategy: list divisions → for each division, list .md files → fetch each file.
 */
export async function fetchAllAgents(opts?: {
  githubApiBase?: string
  githubRawBase?: string
  timeoutMs?: number
  retries?: number
  token?: string
}): Promise<FetchedFile[]> {
  const apiBase = opts?.githubApiBase ?? GITHUB_API_BASE
  const rawBase = opts?.githubRawBase ?? GITHUB_RAW_BASE
  const requestOptions: RequestOptions = {
    timeoutMs: opts?.timeoutMs,
    retries: opts?.retries,
    token: opts?.token,
  }

  const divisions = await listDivisions(apiBase, requestOptions)
  const files: FetchedFile[] = []

  // Fetch files in batches to be gentle on the API
  for (const division of divisions) {
    const mdPaths = await listMdFiles(division, apiBase, requestOptions)
    for (const mdPath of mdPaths) {
      const content = await fetchRawContent(mdPath, rawBase, requestOptions)
      files.push({ path: mdPath, content })
    }
  }

  return files
}

/** Check GitHub API rate limit status */
export async function checkRateLimit(apiBase?: string): Promise<{
  remaining: number
  reset: string
}> {
  const url = `${apiBase ?? GITHUB_API_BASE}/rate_limit`
  const { response, data } = await fetchJson<{ resources: { core: { remaining: number; reset: number } } }>(url)

  if (!response.ok) {
    throw new Error(`Rate limit check failed: ${response.status}`)
  }

  return {
    remaining: data.resources.core.remaining,
    reset: new Date(data.resources.core.reset * 1000).toISOString(),
  }
}
