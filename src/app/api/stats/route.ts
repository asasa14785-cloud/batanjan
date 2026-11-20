import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { sounds } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      seconds: sql<number>`coalesce(sum(duration),0)::float`,
      bytes: sql<number>`coalesce(sum(size),0)::float`,
      videos: sql<number>`count(distinct video_slug)::int`,
      packs: sql<number>`count(distinct pack)::int`,
      creators: sql<number>`count(distinct creator)::int`,
    })
    .from(sounds);
  const categories = await db
    .select({ id: sounds.category, count: sql<number>`count(*)::int`, seconds: sql<number>`sum(duration)::float` })
    .from(sounds)
    .groupBy(sounds.category)
    .orderBy(sql`count(*) desc`);
  const repos = await db
    .select({ id: sounds.repo, count: sql<number>`count(*)::int`, seconds: sql<number>`sum(duration)::float`, bytes: sql<number>`sum(size)::float` })
    .from(sounds)
    .groupBy(sounds.repo)
    .orderBy(sql`count(*) desc`);
  const packs = await db
    .select({ pack: sounds.pack, repo: sounds.repo, license: sql<string>`min(license)`, url: sql<string | null>`min(source_url)`, count: sql<number>`count(*)::int` })
    .from(sounds)
    .where(sql`repo <> 'motionvideo-opus'`)
    .groupBy(sounds.pack, sounds.repo)
    .orderBy(sql`count(*) desc`);
  const videos = await db
    .select({
      slug: sounds.videoSlug,
      title: sql<string>`min(video_title)`,
      creator: sql<string>`min(creator)`,
      poster: sql<string | null>`min(poster_url)`,
      url: sql<string | null>`min(video_url)`,
      count: sql<number>`count(*)::int`,
      seconds: sql<number>`sum(duration)::float`,
    })
    .from(sounds)
    .where(sql`video_slug is not null`)
    .groupBy(sounds.videoSlug)
    .orderBy(sql`count(*) desc, min(video_title)`);
  return NextResponse.json({ totals, categories, repos, packs, videos });
}
