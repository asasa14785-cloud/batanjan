import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { sounds } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);

const soundColumns = {
  id: sounds.id,
  name: sounds.name,
  nameAr: sounds.nameAr,
  category: sounds.category,
  kind: sounds.kind,
  tags: sounds.tags,
  repo: sounds.repo,
  pack: sounds.pack,
  creator: sounds.creator,
  license: sounds.license,
  attribution: sounds.attribution,
  sourceUrl: sounds.sourceUrl,
  videoSlug: sounds.videoSlug,
  videoTitle: sounds.videoTitle,
  videoUrl: sounds.videoUrl,
  posterUrl: sounds.posterUrl,
  segStart: sounds.segStart,
  segEnd: sounds.segEnd,
  duration: sounds.duration,
  size: sounds.size,
  peaks: sounds.peaks,
  peakDb: sounds.peakDb,
  rmsDb: sounds.rmsDb,
  brightness: sounds.brightness,
  flatness: sounds.flatness,
  attackMs: sounds.attackMs,
};

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const cats = (sp.get("cat") ?? "").split(",").filter(Boolean);
  const repos = (sp.get("repo") ?? "").split(",").filter(Boolean);
  const kind = sp.get("kind");
  const ids = (sp.get("ids") ?? "").split(",").filter((x) => /^[a-f0-9]{10}$/.test(x)).slice(0, 300);
  const min = Number(sp.get("min") ?? "");
  const max = Number(sp.get("max") ?? "");
  const video = sp.get("video");
  const sort = sp.get("sort") ?? "relevance";
  const offset = Math.max(0, Number(sp.get("offset") ?? 0) || 0);
  const limit = Math.min(120, Math.max(1, Number(sp.get("limit") ?? 48) || 48));
  const similar = sp.get("similar");

  const conds: SQL[] = [];
  for (const tok of q.split(/\s+/).filter(Boolean).slice(0, 6)) conds.push(ilike(sounds.search, `%${escapeLike(tok)}%`));
  if (cats.length) conds.push(inArray(sounds.category, cats));
  if (repos.length) conds.push(inArray(sounds.repo, repos));
  if (kind) conds.push(eq(sounds.kind, kind));
  if (video) conds.push(eq(sounds.videoSlug, video));
  if (sp.get("ids") !== null) conds.push(ids.length ? inArray(sounds.id, ids) : sql`false`);
  if (Number.isFinite(min) && sp.get("min")) conds.push(gte(sounds.duration, min));
  if (Number.isFinite(max) && sp.get("max")) conds.push(lte(sounds.duration, max));

  let orderBy: SQL[];
  if (similar) {
    const [ref] = await db.select().from(sounds).where(eq(sounds.id, similar)).limit(1);
    if (ref) {
      conds.push(sql`${sounds.id} <> ${ref.id}`);
      orderBy = [
        sql`(case when ${sounds.category} = ${ref.category} then 0 else 60 end)
          + abs(${sounds.brightness} - ${ref.brightness}) * 0.6
          + abs(${sounds.flatness} - ${ref.flatness}) * 0.5
          + abs(ln(${sounds.duration} + 0.05) - ln(${ref.duration} + 0.05)) * 25
          + abs(${sounds.rmsDb} - ${ref.rmsDb}) * 0.8`,
      ];
    } else orderBy = [asc(sounds.name)];
  } else {
    switch (sort) {
      case "name":
        orderBy = [asc(sounds.name)];
        break;
      case "short":
        orderBy = [asc(sounds.duration)];
        break;
      case "long":
        orderBy = [desc(sounds.duration)];
        break;
      case "loud":
        orderBy = [desc(sounds.rmsDb)];
        break;
      case "bright":
        orderBy = [desc(sounds.brightness)];
        break;
      case "dark":
        orderBy = [asc(sounds.brightness)];
        break;
      case "shuffle":
        orderBy = [sql`md5(${sounds.id} || ${sp.get("seed") ?? "x"})`];
        break;
      default:
        orderBy = q
          ? [sql`(case when lower(${sounds.name}) like ${q + "%"} then 0 when lower(${sounds.name}) like ${"%" + q + "%"} then 1 else 2 end)`, asc(sounds.name)]
          : cats.length || repos.length || video || sp.get("ids") !== null
            ? [asc(sounds.name)]
            : [sql`md5(${sounds.id})`];
    }
  }

  const where = conds.length ? and(...conds) : undefined;
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(sounds).where(where);
  const items = await db.select(soundColumns).from(sounds).where(where).orderBy(...orderBy).limit(limit).offset(offset);
  return NextResponse.json({ total, items });
}
