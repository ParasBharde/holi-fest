import { ensureTable, getSql } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { name, score } = req.body || {};
    const cleanName = String(name || "Guest").trim().slice(0, 32);
    const cleanScore = Number.isFinite(Number(score)) ? Math.max(0, Math.floor(Number(score))) : 0;

    const sql = getSql();
    await ensureTable(sql);
    await sql`INSERT INTO holi_scores (name, score) VALUES (${cleanName || "Guest"}, ${cleanScore})`;

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save score", detail: error.message });
  }
}
