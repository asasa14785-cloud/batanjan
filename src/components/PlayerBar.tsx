"use client";
import { CAT_MAP } from "@/lib/categories";
import { player, useFavorites, usePlayer } from "@/lib/store";
import { fmtClock } from "@/lib/types";
import { LiveWaveform } from "./Waveform";
import { IconDownload, IconHeart, IconLoop, IconPause, IconPlay, IconSkipNext, IconSkipPrev, IconVolume } from "./Icons";
import { useProgress } from "@/lib/store";

function Time({ id, duration }: { id: string; duration: number }) {
  const p = useProgress(id);
  return (
    <span dir="ltr" className="w-[84px] text-center text-[11px] tabular-nums text-white/55">
      {fmtClock(p * duration)} / {fmtClock(duration)}
    </span>
  );
}

export function PlayerBar() {
  const { current, playing, loop, autoNext, volume } = usePlayer();
  const fav = useFavorites();
  if (!current) return null;
  const cat = CAT_MAP[current.category];
  const hue = cat?.hue ?? 200;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0c12]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:w-[28%]">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `hsl(${hue} 80% 60% / .2)` }}>
            {cat?.icon}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white" dir="auto">
              {current.name}
            </div>
            <div className="truncate text-xs text-white/50" dir="auto">
              {current.nameAr}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white">
          <button aria-label="السابق" onClick={() => player.prev()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <IconSkipPrev />
          </button>
          <button
            aria-label={playing ? "إيقاف" : "تشغيل"}
            onClick={() => player.toggle()}
            className="grid h-11 w-11 place-items-center rounded-full text-black transition active:scale-90"
            style={{ background: `hsl(${hue} 95% 66%)` }}
          >
            {playing ? <IconPause fill /> : <IconPlay fill />}
          </button>
          <button aria-label="التالي" onClick={() => player.next()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <IconSkipNext />
          </button>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <LiveWaveform id={current.id} peaks={current.peaks} hue={hue} height={38} onSeek={(f) => player.seek(f)} />
          <Time id={current.id} duration={current.duration} />
        </div>

        <div className="ms-auto flex items-center gap-1 text-white/60">
          <button
            aria-label="تكرار"
            onClick={() => player.setLoop(!loop)}
            className={`grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 ${loop ? "bg-white/15 text-white" : ""}`}
            title="تكرار الصوت"
          >
            <IconLoop />
          </button>
          <button
            onClick={() => player.setAutoNext(!autoNext)}
            className={`hidden rounded-full px-2.5 py-1 text-[11px] hover:bg-white/10 sm:block ${autoNext ? "bg-white/15 text-white" : ""}`}
            title="الانتقال التلقائي للصوت التالي"
          >
            تتابع
          </button>
          <button
            aria-label="مفضلة"
            onClick={() => fav.toggle(current.id)}
            className={`grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 ${fav.has(current.id) ? "text-rose-400" : ""}`}
          >
            <IconHeart fill={fav.has(current.id)} />
          </button>
          <a aria-label="تنزيل" href={`/api/audio/${current.id}?dl=1`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <IconDownload />
          </a>
          <div className="hidden items-center gap-2 lg:flex">
            <IconVolume />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              className="h-1 w-24 accent-fuchsia-400"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
