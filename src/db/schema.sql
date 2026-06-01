-- Conversation table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,      -- 'user', 'assistant', 'tool
    content TEXT NOT NULL,
    tool_name VARCHAR(100),         -- which tool was called (if any)
    tool_result TEXT,               -- what the tool returned (if any)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);  

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);