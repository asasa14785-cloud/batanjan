import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { zipSync } from "fflate";
import { db } from "@/db";
import { sounds } from "@/db/schema";
import { AUDIO_DIR, ensureSeeded } from "@/lib/seed";
import { CAT_MAP } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const body = (await req.json().catch(() => ({}))) as { ids?: string[] };
  const ids = (body.ids ?? []).filter((x) => /^[a-f0-9]{10}$/.test(x)).slice(0, 400);
  if (!ids.length) return NextResponse.json({ error: "no ids" }, { status: 400 });
  const rows = await db.select({ id: sounds.id, name: sounds.name, category: sounds.category }).from(sounds).where(inArray(sounds.id, ids));
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  const used = new Set<string>();
  for (const r of rows) {
    const f = path.join(AUDIO_DIR, `${r.id}.m4a`);
    if (!fs.existsSync(f)) continue;
    const folder = (CAT_MAP[r.category]?.en ?? r.category).replace(/[^\w &-]+/g, "");
    let base = r.name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || r.id;
    let entry = `${folder}/${base}.m4a`;
    if (used.has(entry)) entry = `${folder}/${base} (${r.id.slice(0, 4)}).m4a`;
    used.add(entry);
    files[entry] = [new Uint8Array(fs.readFileSync(f)), { level: 0 }];
  }
  const zip = zipSync(files);
  return new Response(Buffer.from(zip), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="sound-library-pack.zip"', "Content-Length": String(zip.length) },
  });
}
