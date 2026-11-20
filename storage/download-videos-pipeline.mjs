// Stage 1: download every video, probe, extract audio to WAV (temp) and record metadata
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";
const run = promisify(execFile);

const videos = JSON.parse(fs.readFileSync("/tmp/work/repo/data/videos.json", "utf8"));
const VID = "/tmp/work/vid", WAV = "/tmp/work/wav", META = "/tmp/work/meta";
for (const d of [VID, WAV, META]) fs.mkdirSync(d, { recursive: true });

let done = 0;
async function one(v) {
  const metaFile = path.join(META, v.slug + ".json");
  if (fs.existsSync(metaFile)) { done++; return; }
  const vf = path.join(VID, v.slug + ".mp4");
  try {
    if (!fs.existsSync(vf)) {
      const r = await fetch(v.video_url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      fs.writeFileSync(vf, Buffer.from(await r.arrayBuffer()));
    }
    const { stdout } = await run(ffprobe.path, ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", vf], { maxBuffer: 1 << 24 });
    const info = JSON.parse(stdout);
    const a = info.streams.find((s) => s.codec_type === "audio");
    const vs = info.streams.find((s) => s.codec_type === "video");
    const meta = { slug: v.slug, duration: parseFloat(info.format.duration || "0"), hasAudio: !!a, audioCodec: a?.codec_name ?? null, sampleRate: a ? +a.sample_rate : null, channels: a?.channels ?? null, fps: vs?.r_frame_rate ?? null };
    if (a) {
      await run(ffmpegPath, ["-v", "error", "-y", "-i", vf, "-vn", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", path.join(WAV, v.slug + ".wav")]);
    }
    fs.writeFileSync(metaFile, JSON.stringify(meta));
    fs.unlinkSync(vf);
  } catch (e) {
    fs.writeFileSync(metaFile, JSON.stringify({ slug: v.slug, error: String(e.message || e) }));
  }
  done++;
  if (done % 20 === 0) console.log("progress", done, "/", videos.length);
}

const queue = [...videos];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await one(queue.shift()); }));
console.log("STAGE1 DONE", done);
