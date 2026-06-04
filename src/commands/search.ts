import { Command } from 'commander'

export function registerSearchCommand(program: Command): void {
  program
    .command('search')
    .description('Search for linked agents')
    .argument('[query]', 'Search query')
    .action(async (query?: string) => {
      // TODO: implement agent search
      console.log('search command — not yet implemented')
    })
}
