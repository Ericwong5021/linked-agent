#!/usr/bin/env node

import { Command } from 'commander'
import { VERSION } from './version.js'
import { registerListCommand } from './commands/list.js'
import { registerShowCommand } from './commands/show.js'
import { registerSearchCommand } from './commands/search.js'

const program = new Command()

program
  .name('linked-agent')
  .description('CLI tool for browsing LinkedIn agents')
  .version(VERSION)

registerListCommand(program)
registerShowCommand(program)
registerSearchCommand(program)

program.parse()
