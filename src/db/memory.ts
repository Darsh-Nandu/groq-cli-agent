import { pool } from "./database";

export interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  tool_name?: string;
  tool_result?: string;
}

// Save a message to the database
export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant" | "tool",
  content: string,
  toolName?: string,
  toolResult?: string
): Promise<void> {
  await pool.query(
    `INSERT INTO messages (session_id, role, content, tool_name, tool_result)
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, role, content, toolName ?? null, toolResult ?? null]
  );
}

// Only load user and assistant messages as history context
// Tool messages are excluded — they require tool_call_id which we don't store
export async function getHistory(
  sessionId: string,
  limit: number = 10
): Promise<Message[]> {
  const result = await pool.query(
    `SELECT role, content
     FROM messages
     WHERE session_id = $1
     AND role IN ('user', 'assistant')
     ORDER BY created_at DESC
     LIMIT $2`,
    [sessionId, limit]
  );

  return result.rows.reverse();
}

// Get all sessions
export async function getAllSessions(): Promise<string[]> {
  const result = await pool.query(
    `SELECT DISTINCT session_id, MIN(created_at) as started_at
     FROM messages
     GROUP BY session_id
     ORDER BY started_at DESC`
  );
  return result.rows.map((r) => r.session_id);
}

// Clear history for a session
export async function clearHistory(sessionId: string): Promise<void> {
  await pool.query(`DELETE FROM messages WHERE session_id = $1`, [sessionId]);
}