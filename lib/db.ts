import postgres from 'postgres';

let sql: postgres.Sql | null = null;

function getClient() {
  if (sql) return sql;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  sql = postgres(databaseUrl, {
    ssl: 'require',
    max: 5,
    prepare: false
  });
  return sql;
}

export type UserRow = {
  id: string;
  name: string;
  created_at: string;
};

export async function createUser(name: string) {
  const client = getClient();
  const rows = await client<UserRow[]>`
    INSERT INTO users (name)
    VALUES (${name})
    RETURNING id, name, created_at
  `;
  return rows[0];
}

export async function getUserCount() {
  const client = getClient();
  const rows = await client<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
  return Number(rows[0].count);
}

export async function getUsers() {
  const client = getClient();
  return client<UserRow[]>`SELECT id, name, created_at FROM users ORDER BY created_at DESC`;
}
