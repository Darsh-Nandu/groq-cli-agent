import chalk from "chalk";

export const logger = {
  info: (msg: string) => console.log(chalk.cyan("i " + msg)),
  success: (msg: string) => console.log(chalk.green("v " + msg)),
  error: (msg: string) => console.log(chalk.red("X " + msg)),
  warn: (msg: string) => console.log(chalk.yellow("! " + msg)),
  agent: (msg: string) => console.log(chalk.magenta("[Agent] " + msg)),
  tool: (msg: string) => console.log(chalk.blue("[Tool] " + msg)),
};  