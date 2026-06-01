<div align="center">

# 🤖 groq-fs-agent

### *Talk to your filesystem in plain English*

A blazing-fast, agentic CLI tool powered by **Groq** + **LLaMA 3.3 70b** that understands natural language commands and autonomously manages your filesystem — with persistent memory via PostgreSQL.

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70b-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

<br/>

[Features](#-features) • [How It Works](#-how-it-works) • [Installation](#-installation) • [Database Setup](#-database-setup) • [Usage](#-usage) • [Tools](#-available-tools)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🧠 | **Natural Language** | Just type what you want — no flags, no syntax to remember |
| 🔗 | **Multi-Tool Chaining** | Agent calls multiple tools automatically in a single request |
| 💾 | **Persistent Memory** | Full conversation history stored in PostgreSQL across your session |
| ⚡ | **Groq Powered** | Blazing fast LLM inference with LLaMA 3.3 70b |
| 💬 | **Two Modes** | Single command or full interactive chat session |
| 🏗️ | **Clean Architecture** | Fully typed TypeScript with clear separation of concerns |

---

## ⚙️ How It Works

```
  You type a natural language command
              │
              ▼
      Commander.js parses CLI
              │
              ▼
      Load conversation history
        from PostgreSQL
              │
              ▼
      Groq LLM decides which
      tool(s) to call
              │
              ▼
  ┌─────── Multi-Tool Loop ──────────┐
  │                                  │
  │  toolRunner executes the tool    │
  │  result is fed back to the LLM   │
  │  repeats until task is complete  │
  │                                  │
  └──────────────────────────────────┘
              │
              ▼
    Natural language response
    saved to PostgreSQL + printed
```

> This is the **ReAct agentic loop** — the same pattern used by Gemini CLI, Claude Code, and other modern AI agents.

---

## 🏛️ Project Structure

```
groq-fs-agent/
├── src/
│   ├── agent/
│   │   ├── agent.ts          # Core AI loop with multi-tool chaining
│   │   └── toolRunner.ts     # Maps LLM tool calls → real functions
│   ├── config/
│   │   └── groq.ts           # Groq client initialization
│   ├── db/
│   │   ├── database.ts       # PostgreSQL pool + connection management
│   │   ├── memory.ts         # Save & retrieve conversation history
│   │   └── schema.sql        # Table definitions (reference)
│   ├── tools/
│   │   ├── createFile.ts
│   │   ├── readFile.ts
│   │   ├── scanFiles.ts
│   │   ├── editFile.ts
│   │   ├── deleteFile.ts
│   │   └── index.ts          # Barrel exports
│   ├── utils/
│   │   └── logger.ts         # ANSI color logger (zero dependencies)
│   └── index.ts              # CLI entry point
├── .env.example
├── .gitignore
├── tsconfig.json
└── package.json
```

---

## 📋 Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org) **v18 or higher**
- [PostgreSQL](https://www.postgresql.org/download/) **v14 or higher**
- A free [Groq API key](https://console.groq.com)

---

## 🚀 Installation

**1. Clone the repository**

```bash
git clone https://github.com/Darsh-Nandu/groq-fs-agent.git
cd groq-fs-agent
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Then open `.env` and fill in your values — see [Configuration](#-configuration) below.

---

## 🗄️ Database Setup

### Step 1 — Start PostgreSQL

**Windows (PowerShell):**
```powershell
net start postgresql-x64-16
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo service postgresql start
```

### Step 2 — Create the database

```bash
psql -U postgres
```

```sql
CREATE DATABASE groq_agent_db;

-- verify it exists
\l

-- exit
\q
```

### Step 3 — Done! Tables are auto-created

No migrations needed. On first run, the agent automatically creates this table:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  session_id  VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL,
  content     TEXT         NOT NULL,
  tool_name   VARCHAR(100),
  tool_result TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Configuration

Your `.env` file should look like this:

```env
# ─── Groq ────────────────────────────────────────
# Get your free API key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# ─── PostgreSQL ──────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=groq_agent_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

---

## 💻 Usage

### Single Command Mode

Perfect for quick one-off tasks:

```bash
npm run dev ask "create a file called hello.ts with a hello world function"
```

### Interactive Chat Mode

Full conversation with memory — the agent remembers everything you say:

```bash
npm run dev chat
```

**Special commands inside chat:**

| Command | Action |
|---------|--------|
| `exit` | Quit the agent |
| `clear` | Wipe memory for the current session |

---

## 🔧 Available Tools

| Tool | What it does | Try saying... |
|------|-------------|---------------|
| `create_file` | Creates a new file with content | *"create a file called server.ts with express boilerplate"* |
| `read_file` | Reads and displays a file | *"read the file package.json"* |
| `scan_files` | Lists all files in a directory | *"scan the src folder"* |
| `edit_file` | Overwrites a file with new content | *"edit hello.ts and add a goodbye function"* |
| `delete_file` | Deletes a file permanently | *"delete the file temp.txt"* |

---

## 💬 Example Sessions

### Multi-tool chaining in action

```bash
$ npm run dev ask "create a file called notes.ts and then read it back to me"

[Agent] Processing: "create a file called notes.ts and then read it back to me"
[Tool]  Running tool: create_file
v       Created file: notes.ts
[Tool]  Running tool: read_file
v       Read file: notes.ts
[Agent] Done! I created notes.ts and here's what it contains: ...
```

### Persistent memory across messages

```bash
$ npm run dev chat

[Agent] Interactive mode started! Type 'exit' to quit, 'clear' to reset memory.
──────────────────────────────────────────────────

You: My name is Darsh
[Agent] Hey Darsh! How can I help you today?

You: scan the current directory
[Tool]  Running tool: scan_files
v       Scanned directory: ./
[Agent] Here are the contents of your current directory: ...

You: what is my name?
[Agent] Your name is Darsh — you told me at the start of our conversation!

You: exit
[Agent] Goodbye!
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript 5.4** | Type-safe, production-grade codebase |
| **Groq SDK** | Ultra-fast LLM inference with LLaMA 3.3 70b |
| **Commander.js** | CLI argument and command parsing |
| **PostgreSQL + pg** | Persistent conversation memory |
| **uuid** | Unique session ID per conversation |
| **dotenv** | Secure environment variable management |
| **Node.js fs** | Native filesystem operations |

---

<div align="center">

Made with ❤️ by **Darsh Nandu**

B.Tech in Data Science & AI — IIT Bhilai

[![GitHub](https://img.shields.io/badge/GitHub-Darsh--Nandu-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Darsh-Nandu)

<br/>

⭐ Star this repo if you found it useful!

</div>