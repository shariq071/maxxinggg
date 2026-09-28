import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:data/maxxing.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Ensure table exists on first connection
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL,
      score REAL NOT NULL,
      metrics TEXT NOT NULL,
      image_data TEXT NOT NULL,
      ip_address TEXT DEFAULT 'Unknown',
      city TEXT DEFAULT 'Unknown',
      region TEXT DEFAULT 'Unknown',
      country TEXT DEFAULT 'Unknown',
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function saveSubmission(entry: any) {
  await initDb();
  const id = entry.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const metricsStr = typeof entry.metrics === 'string' ? entry.metrics : JSON.stringify(entry.metrics || {});

  await db.execute({
    sql: `
      INSERT INTO submissions (id, handle, score, metrics, image_data, ip_address, city, region, country, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      entry.handle || 'anonymous',
      typeof entry.score === 'number' ? entry.score : 6.5,
      metricsStr,
      entry.imageData || entry.image_data || '',
      entry.ip_address ?? 'Unknown',
      entry.city ?? 'Unknown',
      entry.region ?? 'Unknown',
      entry.country ?? 'Unknown',
      entry.latitude ?? null,
      entry.longitude ?? null,
    ],
  });

  return id;
}

export async function getAllSubmissions() {
  await initDb();
  const res = await db.execute("SELECT * FROM submissions ORDER BY created_at DESC");
  return res.rows;
}
