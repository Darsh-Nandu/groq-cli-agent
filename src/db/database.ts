import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

// Create a connection pool - reuses connections insted of creating new ones
export const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "groq_agent_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    max: 10, // max 10 connections in pool
    idleTimeoutMillis: 30000, // close idle connections after 30s
    connectionTimeoutMillis: 2000, // return an error after 2s if connection could not be established
});

// Test the conection on startup
export async function connectDB(): Promise<void> {
    try {
        const client = await pool.connect();
        logger.success("Connected to PostgreSQL!");
        client.release();
    } catch (err: any) {
        logger.error(`Database connection failed: ${err.message}`);
        throw err;
    }
}

// Run the schema to create tables if they don't exist
export async function initDB(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        tool_name VARCHAR(100),
        tool_result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    `);
    logger.success("Database schema initialized!");
  } catch (err: any) {
    logger.error(`Schema initialization failed: ${err.message}`);
    throw err;
  }
}