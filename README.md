# linked-agent

CLI tool for browsing LinkedIn agents.

## Installation

```bash
npm install -g linked-agent
```

Or link locally for development:

```bash
npm link
```

## Usage

```bash
linked-agent --version
linked-agent --help
linked-agent list
linked-agent show [agent-id]
linked-agent search [query]
```

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

## Project Structure

```
linked-agent/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts          # CLI entry point
│   ├── version.ts        # Version constant
│   ├── commands/
│   │   ├── list.ts       # List agents
│   │   ├── show.ts       # Show agent details
│   │   └── search.ts     # Search agents
│   └── utils/
│       └── logger.ts     # Unified output utilities
├── .gitignore
└── README.md
```

## License

MIT
