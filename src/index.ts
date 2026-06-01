import { Command } from "commander";
import * as readline from "readline";
import { v4 as uuidv4 } from "uuid";
import { runAgent } from "./agent/agent";
import { logger, showSplash, showHelp } from "./utils/logger";
import { connectDB, initDB } from "./db/database";
import { clearHistory, getAllSessions, deleteSession } from "./db/memory";

const program = new Command();

program
  .name("groq-agent")
  .description("A CLI AI agent powered by Groq that manages your filesystem")
  .version("1.0.0");

// ── help command ───────────────────────────────────────────
program
  .command("help")
  .description("Show help menu")
  .action(() => {
    showSplash();
    showHelp();
    process.exit(0);
  });

// ── ask command ────────────────────────────────────────────
program
  .command("ask <prompt>")
  .description("Send a single command to the AI agent")
  .action(async (prompt: string) => {
    showSplash();
    try {
      await connectDB();
      await initDB();
      const sessionId = uuidv4();
      await runAgent(prompt, sessionId);
      process.exit(0);
    } catch (err: any) {
      logger.error(`Agent error: ${err.message}`);
      process.exit(1);
    }
  });

// ── sessions command ───────────────────────────────────────
program
  .command("sessions")
  .description("List all past conversation sessions")
  .action(async () => {
    showSplash();
    try {
      await connectDB();
      await initDB();

      const sessions = await getAllSessions();

      if (sessions.length === 0) {
        logger.warn("No past sessions found.");
        process.exit(0);
      }

      console.log("\n" + "─".repeat(80));
      logger.info(`Found ${sessions.length} past session(s):\n`);

      sessions.forEach((s, index) => {
        const date = new Date(s.started_at).toLocaleString();
        const preview = s.last_message?.slice(0, 60) ?? "No messages";
        const truncated = s.last_message?.length > 60 ? "..." : "";
        console.log(`  ${index + 1}. Session ID : ${s.session_id}`);
        console.log(`     Started    : ${date}`);
        console.log(`     Messages   : ${s.message_count}`);
        console.log(`     Last msg   : ${preview}${truncated}`);
        console.log("─".repeat(80));
      });

      console.log(`\nTo resume a session run:\n  npm run dev resume <session_id>\n`);
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error fetching sessions: ${err.message}`);
      process.exit(1);
    }
  });

// ── resume command ─────────────────────────────────────────
program
  .command("resume <sessionId>")
  .description("Resume a past conversation session")
  .action(async (sessionId: string) => {
    showSplash();
    try {
      await connectDB();
      await initDB();

      const sessions = await getAllSessions();
      const exists = sessions.find((s) => s.session_id === sessionId);

      if (!exists) {
        logger.error(`Session "${sessionId}" not found.`);
        logger.info(`Run "npm run dev sessions" to see all available sessions.`);
        process.exit(1);
      }

      logger.success(`Resuming session: ${sessionId}`);
      logger.info(`This session has ${exists.message_count} messages.`);
      console.log("─".repeat(50));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      logger.agent("Session resumed! Type 'exit' to quit, 'clear' to reset memory.");
      console.log("─".repeat(50));

      const askQuestion = () => {
        process.stdout.write("\nYou: ");
        rl.once("line", async (input: string) => {
          const trimmed = input.trim();
          if (!trimmed) { askQuestion(); return; }
          if (trimmed.toLowerCase() === "exit") {
            logger.agent("Goodbye!"); rl.close(); process.exit(0); return;
          }
          if (trimmed.toLowerCase() === "clear") {
            await clearHistory(sessionId);
            logger.info("Memory cleared!"); askQuestion(); return;
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
    } catch (err: any) {
      logger.error(`Error resuming session: ${err.message}`);
      process.exit(1);
    }
  });

// ── delete command ─────────────────────────────────────────
program
  .command("delete <sessionId>")
  .description("Delete a past conversation session")
  .action(async (sessionId: string) => {
    showSplash();
    try {
      await connectDB();
      await initDB();

      const sessions = await getAllSessions();
      const exists = sessions.find((s) => s.session_id === sessionId);

      if (!exists) {
        logger.error(`Session "${sessionId}" not found.`);
        logger.info(`Run "npm run dev sessions" to see all available sessions.`);
        process.exit(1);
      }

      await deleteSession(sessionId);
      logger.success(`Session deleted: ${sessionId}`);
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error deleting session: ${err.message}`);
      process.exit(1);
    }
  });

// ── chat command ───────────────────────────────────────────
program
  .command("chat")
  .description("Start a new interactive session with the AI agent")
  .action(async () => {
    showSplash();
    await connectDB();
    await initDB();

    const sessionId = uuidv4();
    logger.info(`New Session ID: ${sessionId}`);

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
        if (!trimmed) { askQuestion(); return; }
        if (trimmed.toLowerCase() === "exit") {
          logger.agent("Goodbye!"); rl.close(); process.exit(0); return;
        }
        if (trimmed.toLowerCase() === "clear") {
          await clearHistory(sessionId);
          logger.info("Memory cleared!"); askQuestion(); return;
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