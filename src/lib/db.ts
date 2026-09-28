import Database from 'better-sqlite3';
import path from 'path';

// Singleton instance to prevent multiple DB connections during dev hot-reloads
let db: Database.Database;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'maxxing.db');
    db = new Database(dbPath);
    
    // Create submissions table if it doesn't exist
    db.exec(`
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
  return db;
}

export type SubmissionEntry = {
  id: string;
  handle: string;
  score: number;
  metrics: string;
  image_data: string;
  ip_address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function saveSubmission(entry: SubmissionEntry) {
  const database = getDb();
  
  const stmt = database.prepare(`
    INSERT INTO submissions (
      id, handle, score, metrics, image_data, ip_address, city, region, country, latitude, longitude
    ) VALUES (
      @id, @handle, @score, @metrics, @image_data, @ip_address, @city, @region, @country, @latitude, @longitude
    )
  `);

  return stmt.run({
    id: entry.id,
    handle: entry.handle,
    score: entry.score,
    metrics: entry.metrics,
    image_data: entry.image_data,
    ip_address: entry.ip_address ?? null,
    city: entry.city ?? null,
    region: entry.region ?? null,
    country: entry.country ?? null,
    latitude: entry.latitude ?? null,
    longitude: entry.longitude ?? null,
  });
}

export function getAllSubmissions() {
  const database = getDb();
  return database.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
}
