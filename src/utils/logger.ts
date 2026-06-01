const reset = "\x1b[0m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const red = "\x1b[31m";
const yellow = "\x1b[33m";
const magenta = "\x1b[35m";
const blue = "\x1b[34m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";

export const logger = {
  info: (msg: string) => process.stdout.write(cyan + "i " + msg + reset + "\n"),
  success: (msg: string) => process.stdout.write(green + "v " + msg + reset + "\n"),
  error: (msg: string) => process.stdout.write(red + "X " + msg + reset + "\n"),
  warn: (msg: string) => process.stdout.write(yellow + "! " + msg + reset + "\n"),
  agent: (msg: string) => process.stdout.write(magenta + "[Agent] " + msg + reset + "\n"),
  tool: (msg: string) => process.stdout.write(blue + "[Tool] " + msg + reset + "\n"),
};

export function showSplash(): void {
  console.log("\n");
  console.log(cyan + bold + "  ██████╗ ██████╗  ██████╗  ██████╗     ███████╗███████╗" + reset);
  console.log(cyan + bold + " ██╔════╝ ██╔══██╗██╔═══██╗██╔═══██╗    ██╔════╝██╔════╝" + reset);
  console.log(cyan + bold + " ██║  ███╗██████╔╝██║   ██║██║   ██║    █████╗  ███████╗" + reset);
  console.log(cyan + bold + " ██║   ██║██╔══██╗██║   ██║██║▄▄ ██║    ██╔══╝  ╚════██║" + reset);
  console.log(cyan + bold + " ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝    ██║     ███████║" + reset);
  console.log(cyan + bold + "  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚══▀▀═╝     ╚═╝     ╚══════╝" + reset);
  console.log("\n");
  console.log(dim + "  A terminal-based AI agent powered by Groq + LLaMA 3.3 70b" + reset);
  console.log(dim + "  Version 1.0.0  |  by Darsh Nandu  |  IIT Bhilai" + reset);
  console.log("\n");
  console.log(dim + "  " + "─".repeat(56) + reset);
  console.log("\n");
}

export function showHelp(): void {
  console.log(bold + cyan + "  COMMANDS\n" + reset);

  const commands = [
    ["  ask <prompt>", "Send a single natural language command"],
    ["  chat", "Start a new interactive session with memory"],
    ["  sessions", "List all past conversation sessions"],
    ["  resume <id>", "Resume a past session by ID"],
    ["  delete <id>", "Delete a session and all its messages"],
  ];

  commands.forEach(([cmd, desc]) => {
    console.log(
      green + bold + cmd.padEnd(25) + reset +
      dim + desc + reset
    );
  });

  console.log("\n");
  console.log(bold + cyan + "  EXAMPLES\n" + reset);

  const examples = [
    `  npm run dev ask "create a file called hello.ts"`,
    `  npm run dev ask "scan the current directory"`,
    `  npm run dev chat`,
    `  npm run dev sessions`,
    `  npm run dev resume <session-id>`,
  ];

  examples.forEach((ex) => {
    console.log(yellow + ex + reset);
  });

  console.log("\n");
  console.log(bold + cyan + "  TOOLS AVAILABLE\n" + reset);

  const tools = [
    ["  create_file", "Create a new file with AI-generated content"],
    ["  read_file", "Read and display a file's contents"],
    ["  scan_files", "List all files in a directory"],
    ["  edit_file", "Modify an existing file"],
    ["  delete_file", "Permanently delete a file"],
  ];

  tools.forEach(([tool, desc]) => {
    console.log(
      blue + bold + tool.padEnd(25) + reset +
      dim + desc + reset
    );
  });

  console.log("\n" + dim + "  " + "─".repeat(56) + reset + "\n");
}