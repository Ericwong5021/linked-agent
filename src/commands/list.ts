import { Command } from 'commander'

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List linked agents')
    .action(async () => {
      // TODO: implement listing agents
      console.log('list command — not yet implemented')
    })
}
