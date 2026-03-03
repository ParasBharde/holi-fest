import { ensureTable, getSql } from "./_db.js";

export default async function handler(_req, res) {
  try {
    const sql = getSql();
    await ensureTable(sql);

    const rows = await sql`
      SELECT name, MAX(score)::int AS score
      FROM holi_scores
      GROUP BY name
      ORDER BY score DESC, name ASC
      LIMIT 7
    `;

    res.status(200).json({ players: rows });
  } catch (error) {
    res.status(200).json({ players: [], info: "Database not configured yet" });
  }
}
