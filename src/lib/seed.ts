import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { sounds } from "@/db/schema";

export const STORAGE_DIR = path.join(process.cwd(), "storage");
export const AUDIO_DIR = path.join(STORAGE_DIR, "audio");

type ManifestItem = {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  kind: string;
  tags: string[];
  repo: string;
  pack: string;
  creator: string | null;
  license: string;
  attribution: string | null;
  sourceUrl: string | null;
  videoSlug: string | null;
  videoTitle: string | null;
  videoUrl: string | null;
  posterUrl: string | null;
  segStart: number | null;
  segEnd: number | null;
  file: string;
  duration: number;
  size: number;
  peaks: number[];
  peakDb: number;
  rmsDb: number;
  brightness: number;
  flatness: number;
  attackMs: number;
};

const g = globalThis as typeof globalThis & { __seedPromise?: Promise<void> };

async function doSeed() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sounds (
      id text PRIMARY KEY, name text NOT NULL, name_ar text NOT NULL, category text NOT NULL, kind text NOT NULL,
      tags jsonb NOT NULL, repo text NOT NULL, pack text NOT NULL, creator text, license text NOT NULL, attribution text,
      source_url text, video_slug text, video_title text, video_url text, poster_url text, seg_start double precision,
      seg_end double precision, file text NOT NULL, duration double precision NOT NULL, size integer NOT NULL,
      peaks jsonb NOT NULL, peak_db double precision NOT NULL, rms_db double precision NOT NULL, brightness integer NOT NULL,
      flatness integer NOT NULL, attack_ms integer NOT NULL, search text NOT NULL
    )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS sounds_category_idx ON sounds (category)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS sounds_repo_idx ON sounds (repo)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS sounds_duration_idx ON sounds (duration)`);

  const manifestPath = path.join(STORAGE_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) return;
  const manifest: ManifestItem[] = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(sounds);
  if (count === manifest.length) return;

  await db.delete(sounds);
  const rows = manifest.map((m) => ({
    ...m,
    search: [m.name, m.nameAr, m.category, m.pack, m.creator ?? "", m.videoTitle ?? "", m.repo, ...m.tags].join(" ").toLowerCase(),
  }));
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(sounds).values(rows.slice(i, i + 500)).onConflictDoNothing();
  }
}

/** Makes sure the table exists and is filled from storage/manifest.json (idempotent). */
export function ensureSeeded(): Promise<void> {
  if (!g.__seedPromise) {
    g.__seedPromise = doSeed().catch((e) => {
      g.__seedPromise = undefined;
      throw e;
    });
  }
  return g.__seedPromise;
}
