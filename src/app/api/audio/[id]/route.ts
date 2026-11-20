import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sounds } from "@/db/schema";
import { AUDIO_DIR, ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 90) || "sound";
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{10}$/.test(id)) return new Response("Bad id", { status: 400 });
  const file = path.join(AUDIO_DIR, `${id}.m4a`);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const size = fs.statSync(file).size;

  const headers: Record<string, string> = {
    "Content-Type": "audio/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (req.nextUrl.searchParams.get("dl")) {
    await ensureSeeded();
    const [row] = await db.select({ name: sounds.name }).from(sounds).where(eq(sounds.id, id)).limit(1);
    const base = slugify(row?.name ?? id);
    headers["Content-Disposition"] = `attachment; filename="${base.replace(/[^\x20-\x7e]/g, "_")}.m4a"; filename*=UTF-8''${encodeURIComponent(base)}.m4a`;
  }

  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : size - 1;
      if (!m[1] && m[2]) {
        start = Math.max(0, size - parseInt(m[2], 10));
        end = size - 1;
      }
      end = Math.min(end, size - 1);
      if (start > end || start >= size) return new Response("Range Not Satisfiable", { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as unknown as ReadableStream;
      return new Response(stream, { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
    }
  }
  const stream = Readable.toWeb(fs.createReadStream(file)) as unknown as ReadableStream;
  return new Response(stream, { status: 200, headers: { ...headers, "Content-Length": String(size) } });
}
