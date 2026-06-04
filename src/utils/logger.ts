import chalk from 'chalk'
import ora from 'ora'

export function info(message: string): void {
  console.log(chalk.cyan('ℹ'), message)
}

export function success(message: string): void {
  console.log(chalk.green('✔'), message)
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message)
}

export function error(message: string): void {
  console.error(chalk.red('✖'), message)
}

export function startSpinner(text: string) {
  return ora(text).start()
}
