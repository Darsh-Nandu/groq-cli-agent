# groq-fs-agent 🤖

A terminal-based AI agent built with TypeScript and Groq API that understands natural language and autonomously manages your filesystem using LLM-powered tool calling.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?logo=groq)
![Node](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![License](https://img.shields.io/badge/license-ISC-lightgrey)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## ✨ Features

- 🧠 **Natural language commands** — no need to remember CLI flags
- 🔧 **5 filesystem tools** — create, read, scan, edit, delete files
- 💬 **Two modes** — single command or interactive chat session
- ⚡ **Powered by Groq** — blazing fast LLM inference with llama-3.3-70b
- 🏗️ **Clean architecture** — tools / agent / config / utils separation
- 📝 **TypeScript** — fully typed, production-grade codebase

---

## 🏛️ Architecture

```
groq-fs-agent/
├── src/
│   ├── tools/          # Filesystem operations (create, read, scan, edit, delete)
│   ├── agent/          # AI loop (agent.ts) + tool router (toolRunner.ts)
│   ├── config/         # Groq client initialization
│   ├── utils/          # Logger with ANSI colors
│   └── index.ts        # CLI entry point (Commander.js)
```

### How it works

```
User Input (natural language)
        ↓
  Commander.js (CLI parsing)
        ↓
  agent.ts (sends to Groq with tool definitions)
        ↓
  Groq LLM (decides which tool to call + arguments)
        ↓
  toolRunner.ts (maps tool name → real function)
        ↓
  tools/ (executes filesystem operation)
        ↓
  Groq LLM (generates natural language response)
        ↓
  Terminal Output
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
git clone https://github.com/yourusername/groq-fs-agent.git
cd groq-fs-agent
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Run

```bash
# Single command mode
npm run dev ask "create a file called hello.ts with a hello world function"

# Interactive chat mode
npm run dev chat
```

---

## 🔧 Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `create_file` | Create a new file with AI-generated content | "create a file called utils.ts with helper functions" |
| `read_file` | Read and display a file's contents | "read the file config.json" |
| `scan_files` | List all files in a directory | "scan the current directory" |
| `edit_file` | Modify an existing file | "edit hello.ts and add a goodbye function" |
| `delete_file` | Delete a file | "delete the file temp.txt" |

---

## 💬 Example Interactions

```bash
$ npm run dev ask "create a file called server.ts with an express hello world"

[Agent] Processing: "create a file called server.ts with an express hello world"
[Tool]  Running tool: create_file
v       Created file: server.ts
[Agent] I've created server.ts with a basic Express hello world setup!
```

```bash
$ npm run dev chat

[Agent] Interactive mode started! Type 'exit' to quit.
──────────────────────────────────────────────────

You: scan the src directory
[Agent] Processing: "scan the src directory"
[Tool]  Running tool: scan_files
v       Scanned directory: ./src
[Agent] The src directory contains: agent/, config/, tools/, utils/, index.ts

You: exit
[Agent] Goodbye!
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| TypeScript | Type-safe codebase |
| Groq SDK | LLM inference (llama-3.3-70b-versatile) |
| Commander.js | CLI argument parsing |
| Node.js fs | Filesystem operations |
| dotenv | Environment variable management |

---

## 📁 Tool Calling Flow

This project implements the **ReAct-style agentic loop**:

1. **Reason** — LLM receives user input + tool definitions and decides what to do
2. **Act** — Selected tool executes the real filesystem operation
3. **Observe** — Tool result is sent back to LLM
4. **Respond** — LLM generates a natural language summary

This is the same pattern used by Gemini CLI, Claude Code, and other modern AI agents.

---

## 👨‍💻 Author

**Darsh Nandu**
B.Tech, Data Science & AI — IIT Bhilai
