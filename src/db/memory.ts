import { pool } from "./database";

export interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  tool_name?: string;
  tool_result?: string;
}

export interface SessionSummary {
    session_id: string;
    message_count: number;
    started_at: Date;
    last_message: string;
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

// Clear history for a session
export async function clearHistory(sessionId: string): Promise<void> {
  await pool.query(`DELETE FROM messages WHERE session_id = $1`, [sessionId]);
}

// Get all past sessions with preview of last message
export async function getAllSessions(): Promise<SessionSummary[]> {

    const result = await pool.query(
        `SELECT
            session_id,
            COUNT(*) as message_count,
            MIN(created_at) as started_at,
            (
                SELECT content
                FROM messages m2
                WHERE m2.session_id = m1.session_id
                AND m2.role IN ('user', 'assistant')
                ORDER BY created_at DESC
                LIMIT 1

            ) as last_message
            FROM messages m1
            WHERE role IN ('user', 'assistant')
            GROUP BY session_id
            ORDER BY MIN(created_at) DESC`
    );
    return result.rows;
}

// Delete a session and all its messages
export async function deleteSession(sessionId: string): Promise<void> {
    await pool.query(`DELETE FROM messages WHERE session_id = $1`, [sessionId]);
}
