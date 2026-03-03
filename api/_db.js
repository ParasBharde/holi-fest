import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connection = process.env.DATABASE_URL;
  if (!connection) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(connection);
}

export async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS holi_scores (
      id SERIAL PRIMARY KEY,
      name VARCHAR(32) NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
