import { Command } from "commander";
import * as readline from "readline";
import { runAgent } from "./agent/agent";
import { logger } from "./utils/logger";

const program = new Command();

program
    .name("groq-agent")
    .description("A CLI AI agent powered by Groq that manages your filesystem")
    .version("1.0.0");

// Single command mode
program
  .command("chat")
  .description("Start an interactive session with the AI agent")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false, // fix for Windows PowerShell buffering
    });

    logger.agent("Interactive mode started! Type 'exit' to quit.");
    console.log("─".repeat(50));

    const askQuestion = () => {
      process.stdout.write("\nYou: "); // use process.stdout instead of rl.question prompt

      rl.once("line", async (input: string) => {
        const trimmed = input.trim();

        if (!trimmed) {
          askQuestion();
          return;
        }

        if (trimmed.toLowerCase() === "exit") {
          logger.agent("Goodbye!");
          rl.close();
          process.exit(0);
          return;
        }

        try {
          await runAgent(trimmed);
        } catch (err: any) {
          logger.error(`Agent error: ${err.message}`);
        }

        console.log("─".repeat(50));
        askQuestion();
      });
    };

    askQuestion();
  });

program.parse(process.argv);