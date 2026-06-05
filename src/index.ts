#!/usr/bin/env node

import { Command } from 'commander'
import { VERSION } from './version.js'
import { registerListCommand } from './commands/list.js'
import { registerShowCommand } from './commands/show.js'
import { registerSearchCommand } from './commands/search.js'
import { registerCacheCommand } from './commands/cache.js'
import { registerHireCommand } from './commands/hire.js'

const program = new Command()

program
  .name('linked-agent')
  .description('Agent-friendly CLI for discovering, searching, and hiring agent personas')
  .version(VERSION)
  .showHelpAfterError('(add --help for agent-friendly examples)')
  .addHelpText('after', `
Agent-friendly examples:
  $ linked-agent hire "前端设计师" --goal "帮 HR Agent 找招聘人设" --skills "React,Figma,UI" --json
  $ linked-agent show <slug> --json
  $ linked-agent list --search reviewer --json

Recommended workflow for AI agents:
  1. Use \`hire <role> --json\` to get ranked persona candidates.
  2. Use \`show <slug> --json\` to inspect the selected candidate.
  3. Use \`cache status --json\` to verify whether data is fresh.
`)

registerListCommand(program)
registerShowCommand(program)
registerSearchCommand(program)
registerHireCommand(program)
registerCacheCommand(program)

program.parse()
