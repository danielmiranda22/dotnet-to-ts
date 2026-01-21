import chalk from 'chalk';

export class Logger {
  static info(msg: string) {
    console.log(chalk.cyan('ℹ️ ') + msg);
  }

  static success(msg: string) {
    console.log(chalk.green('✅ ') + msg);
  }

  static error(msg: string) {
    console.error(chalk.red('❌ ') + msg);
  }

  static warn(msg: string) {
    console.log(chalk.yellow('⚠️ ') + msg);
  }

  static step(msg: string) {
    console.log(chalk.blue('🔄 ') + msg);
  }

  static debug(msg: string, verbose: boolean) {
    if (verbose) {
      console.log(chalk.gray('🐛 [debug] ') + msg);
    }
  }
}
