"use client";
import { memo, useState } from "react";
import { CAT_MAP, REPO_MAP } from "@/lib/categories";
import { player, useFavorites, usePlayer } from "@/lib/store";
import { fmtDur, fmtSize, type Sound } from "@/lib/types";
import { LiveWaveform } from "./Waveform";
import { IconChevron, IconCopy, IconDownload, IconHeart, IconLink, IconPause, IconPlay, IconSimilar } from "./Icons";

type Props = {
  sound: Sound;
  queue: Sound[];
  onSearchTag: (t: string) => void;
  onSimilar: (s: Sound) => void;
  onVideo: (slug: string) => void;
  onCategory: (id: string) => void;
};

function Meter({ label, value, hue }: { label: string; value: number; hue: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-white/50">
        <span>{label}</span>
        <span dir="ltr">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${Math.max(3, Math.min(100, value))}%`, background: `hsl(${hue} 90% 62%)` }} />
      </div>
    </div>
  );
}

function SoundRowInner({ sound: s, queue, onSearchTag, onSimilar, onVideo, onCategory }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { current, playing } = usePlayer();
  const fav = useFavorites();
  const cat = CAT_MAP[s.category];
  const hue = cat?.hue ?? 200;
  const isCur = current?.id === s.id;
  const isPlaying = isCur && playing;
  const repo = REPO_MAP[s.repo];

  return (
    <div
      className={`group rounded-2xl border transition ${isCur ? "border-white/25 bg-white/[0.07]" : "border-white/[0.06] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]"}`}
      style={isCur ? { boxShadow: `0 0 0 1px hsl(${hue} 90% 60% / .35), 0 10px 40px -12px hsl(${hue} 90% 55% / .35)` } : undefined}
    >
      <div className="flex items-center gap-3 p-2.5 sm:gap-4 sm:p-3">
        <button
          aria-label={isPlaying ? "إيقاف" : "تشغيل"}
          onClick={() => player.play(s, queue)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-black transition active:scale-90"
          style={{ background: `hsl(${hue} 95% 64%)`, boxShadow: isPlaying ? `0 0 24px hsl(${hue} 95% 60% / .7)` : "none" }}
        >
          {isPlaying ? <IconPause fill /> : <IconPlay fill />}
        </button>

        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen((v) => !v)}>
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white" dir="auto">
              {s.name}
            </h3>
          </div>
          <p className="truncate text-[13px] text-white/55" dir="auto">
            {s.nameAr}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">
            <span
              className="rounded-full px-2 py-0.5 font-medium"
              style={{ background: `hsl(${hue} 80% 60% / .16)`, color: `hsl(${hue} 90% 75%)` }}
            >
              {cat?.icon} {cat?.ar ?? s.category}
            </span>
            <span dir="ltr">{fmtDur(s.duration)}</span>
            <span className="max-w-[180px] truncate sm:max-w-[320px]" dir="auto">
              {s.videoSlug ? "🎬 " : ""}
              {s.pack.replace("🎬 ", "")}
            </span>
          </div>
        </div>

        <div className="hidden w-[34%] max-w-md min-w-[140px] md:block" onClick={() => (isCur ? undefined : player.play(s, queue))}>
          <LiveWaveform id={s.id} peaks={s.peaks} hue={hue} height={44} onSeek={(f) => (isCur ? player.seek(f) : player.play(s, queue))} />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-white/60">
          <button
            aria-label="مفضلة"
            onClick={() => fav.toggle(s.id)}
            className={`grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white ${fav.has(s.id) ? "text-rose-400" : ""}`}
          >
            <IconHeart fill={fav.has(s.id)} />
          </button>
          <a
            aria-label="تنزيل"
            href={`/api/audio/${s.id}?dl=1`}
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
          >
            <IconDownload />
          </a>
          <button
            aria-label="تفاصيل"
            onClick={() => setOpen((v) => !v)}
            className={`grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 hover:text-white ${open ? "rotate-180" : ""}`}
          >
            <IconChevron />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.07] p-4">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <LiveWaveform id={s.id} peaks={s.peaks} hue={hue} height={84} bars={96} onSeek={(f) => (isCur ? player.seek(f) : player.play(s, queue))} />
              <div className="flex flex-wrap gap-1.5">
                {s.tags.slice(0, 14).map((t) => (
                  <button
                    key={t}
                    onClick={() => onSearchTag(t)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/65 transition hover:border-white/30 hover:text-white"
                    dir="auto"
                  >
                    #{t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-[13px]">
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(s.name);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/20"
                >
                  <IconCopy size={15} /> {copied ? "تم النسخ ✓" : "نسخ الاسم"}
                </button>
                <button onClick={() => onSimilar(s)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/20">
                  <IconSimilar size={15} /> أصوات مشابهة
                </button>
                <button onClick={() => onCategory(s.category)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/20">
                  {cat?.icon} كل «{cat?.ar}»
                </button>
                {s.videoSlug && (
                  <button onClick={() => onVideo(s.videoSlug!)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 transition hover:bg-white/20">
                    🎬 كل أصوات هذا الفيديو
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Meter label="السطوع (Brightness)" value={s.brightness} hue={hue} />
                <Meter label="الخشونة (Noisiness)" value={s.flatness} hue={hue} />
                <Meter label="القوة (RMS)" value={Math.max(0, 100 + s.rmsDb * 1.6)} hue={hue} />
                <Meter label="سرعة الهجوم" value={100 - Math.min(100, s.attackMs / 3)} hue={hue} />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
                <dt className="text-white/40">المصدر</dt>
                <dd className="text-white/80" dir="auto">
                  {repo?.ar ?? s.repo}
                </dd>
                <dt className="text-white/40">الحزمة</dt>
                <dd className="text-white/80" dir="auto">
                  {s.pack}
                </dd>
                {s.creator && (
                  <>
                    <dt className="text-white/40">المؤلف</dt>
                    <dd className="text-white/80" dir="auto">
                      {s.creator}
                    </dd>
                  </>
                )}
                <dt className="text-white/40">الترخيص</dt>
                <dd className="text-white/80" dir="auto">
                  {s.license}
                </dd>
                <dt className="text-white/40">الحجم</dt>
                <dd className="text-white/80" dir="ltr" style={{ textAlign: "right" }}>
                  {fmtSize(s.size)} · {s.peakDb.toFixed(1)} dBFS · m4a
                </dd>
                {s.segStart != null && (
                  <>
                    <dt className="text-white/40">من الفيديو</dt>
                    <dd className="text-white/80" dir="ltr" style={{ textAlign: "right" }}>
                      {s.segStart.toFixed(2)}s → {s.segEnd?.toFixed(2)}s
                    </dd>
                  </>
                )}
              </dl>
              {s.posterUrl && (
                <a href={s.videoUrl ?? "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-2 transition hover:border-white/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.posterUrl} alt="" loading="lazy" className="h-14 w-24 rounded-lg object-cover" />
                  <div className="min-w-0 text-[12px]">
                    <div className="truncate font-medium text-white" dir="auto">
                      {s.videoTitle}
                    </div>
                    <div className="truncate text-white/50" dir="ltr">
                      {s.creator}
                    </div>
                  </div>
                  <IconLink size={15} />
                </a>
              )}
              {!s.posterUrl && s.sourceUrl && (
                <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-white/60 underline-offset-4 hover:text-white hover:underline">
                  <IconLink size={14} /> صفحة المصدر الأصلي
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SoundRow = memo(SoundRowInner);
