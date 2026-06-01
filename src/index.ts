import { Command } from "commander";
import * as readline from "readline";
import { v4 as uuidv4 } from "uuid";
import { runAgent } from "./agent/agent";
import { logger } from "./utils/logger";
import { connectDB, initDB } from "./db/database";
import { clearHistory } from "./db/memory";

const program = new Command();

program
  .name("groq-agent")
  .description("A CLI AI agent powered by Groq that manages your filesystem")
  .version("1.0.0");

program
  .command("ask <prompt>")
  .description("Send a single command to the AI agent")
  .action(async (prompt: string) => {
    try {
      await connectDB();
      await initDB();
      const sessionId = uuidv4(); // each single command gets its own session
      await runAgent(prompt, sessionId);
      process.exit(0);
    } catch (err: any) {
      logger.error(`Agent error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("chat")
  .description("Start an interactive session with the AI agent")
  .action(async () => {
    await connectDB();
    await initDB();

    const sessionId = uuidv4(); // one session for the whole chat
    logger.info(`Session ID: ${sessionId}`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    logger.agent("Interactive mode started! Type 'exit' to quit, 'clear' to reset memory.");
    console.log("─".repeat(50));

    const askQuestion = () => {
      process.stdout.write("\nYou: ");

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

        if (trimmed.toLowerCase() === "clear") {
          await clearHistory(sessionId);
          logger.info("Memory cleared!");
          askQuestion();
          return;
        }

        try {
          await runAgent(trimmed, sessionId);
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