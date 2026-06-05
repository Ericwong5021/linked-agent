import { Command } from 'commander'

export function registerShowCommand(program: Command): void {
  program
    .command('show')
    .description('Show details of a linked agent')
    .argument('[agent-id]', 'Agent ID to show')
    .action(async (agentId?: string) => {
      // TODO: implement showing agent details
      console.log('show command — not yet implemented')
    })
}
