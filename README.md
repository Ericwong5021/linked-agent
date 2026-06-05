# linked-agent

CLI tool for browsing LinkedIn agents from the [`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents) repository.

## Installation

```bash
npm install -g linked-agent
```

Or link locally for development:

```bash
npm install
npm run build
npm link
```

## Usage

```bash
linked-agent --version
linked-agent --help
linked-agent list
linked-agent show <agent-slug>
linked-agent search <query>
linked-agent cache status
linked-agent cache clear
```

## Commands

### `linked-agent list`

List agents in a table or JSON format.

```bash
linked-agent list
linked-agent list --division engineering
linked-agent list --search reviewer
linked-agent list --sort division --limit 10 --offset 10
linked-agent list --json
linked-agent list --no-cache
```

Options:

| Option | Description |
| --- | --- |
| `--no-cache` | Force a fresh fetch from GitHub. |
| `-d, --division <name>` | Filter by division name. |
| `-s, --search <query>` | Search by name, description, or vibe. |
| `--sort <field>` | Sort by `name` or `division`; defaults to `name`. |
| `--limit <n>` | Max agents per page; defaults to `20`. |
| `--offset <n>` | Starting position for pagination; defaults to `0`. |
| `--json` | Output machine-readable JSON. |

### `linked-agent show <agent-slug>`

Show full details for one agent.

```bash
linked-agent show engineering-code-reviewer
linked-agent show reviewer
linked-agent show engineering-code-reviewer --section mission
linked-agent show engineering-code-reviewer --json
linked-agent show engineering-code-reviewer --no-cache
```

Options:

| Option | Description |
| --- | --- |
| `--no-cache` | Force a fresh fetch from GitHub. |
| `--json` | Output machine-readable JSON. |
| `--section <title>` | Only show sections whose title contains the provided text. |

If an exact slug is not found, `show` attempts a case-insensitive partial slug match. In interactive terminal output, multiple candidates can be selected from a prompt. In JSON mode, candidates are emitted directly.

### `linked-agent search <query>`

Search agents by name, description, or vibe.

```bash
linked-agent search review
linked-agent search "brand systems"
linked-agent search visual --no-cache
```

Options:

| Option | Description |
| --- | --- |
| `--no-cache` | Force a fresh fetch from GitHub. |

### `linked-agent cache`

Manage the local cache.

```bash
linked-agent cache status
linked-agent cache status --json
linked-agent cache clear
linked-agent cache --cache-dir ~/.cache/linked-agent status
```

Options:

| Option | Description |
| --- | --- |
| `--cache-dir <path>` | Use a custom cache directory for cache subcommands. |

## Data source and cache

`linked-agent` fetches Markdown agent files from GitHub and parses frontmatter plus `##`/`###` Markdown sections. Fetched data is cached locally to avoid repeated API calls.

- Default cache directory: `~/.linked-agent/cache/`
- Cache TTL: 24 hours
- Cache files: `agents.json` and `meta.json`

Set `GITHUB_TOKEN` or `GH_TOKEN` to authenticate GitHub API calls and reduce rate-limit risk:

```bash
GITHUB_TOKEN=github_pat_xxx linked-agent list --no-cache
```

Network requests include a timeout and retries for transient failures. If GitHub or DNS is unavailable, the CLI prints a direct network error and exits with a non-zero status.

## Development

### Prerequisites

- Node.js >= 18
- npm

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Type check

```bash
npm run lint
```

### Test

```bash
npm test
```

The test suite uses Node's built-in test runner. It compiles TypeScript into `.test-dist/` and then runs tests from `test/*.test.mjs`.

## Project structure

```text
linked-agent/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── test/
│   ├── cache.test.mjs
│   ├── parser.test.mjs
│   └── search.test.mjs
├── src/
│   ├── index.ts              # CLI entry point
│   ├── version.ts            # Version constant
│   ├── commands/
│   │   ├── cache.ts          # Cache management commands
│   │   ├── list.ts           # List agents
│   │   ├── show.ts           # Show agent details
│   │   ├── search.ts         # Search agents
│   │   └── utils.ts          # Table and JSON output helpers
│   ├── data/
│   │   ├── cache.ts          # Cache read/write/status helpers
│   │   ├── fetcher.ts        # GitHub API/raw fetcher
│   │   ├── index.ts          # Data facade and search helpers
│   │   ├── parser.ts         # Markdown/frontmatter parser
│   │   └── types.ts          # Shared data types/constants
│   └── utils/
│       └── logger.ts         # Unified output utilities
├── .gitignore
└── README.md
```

## License

MIT
