"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAT_MAP } from "@/lib/categories";
import { useFavorites, usePads } from "@/lib/store";
import { fmtDur, type Sound } from "@/lib/types";
import { IconClose, IconSearch, IconShuffle } from "./Icons";

const KEYS = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"];

const KITS: { id: string; label: string; cats: string[] }[] = [
  { id: "motion", label: "🎬 كيت الموشن", cats: ["transitions", "transitions", "impacts", "impacts", "risers", "risers", "ui", "ui", "chimes", "glitch", "scifi", "foley", "transitions", "impacts", "chimes", "ui"] },
  { id: "game", label: "🎮 كيت الألعاب", cats: ["retro", "retro", "magic", "weapons", "creatures", "explosions", "footsteps", "voice", "chimes", "alerts", "scifi", "impacts", "retro", "magic", "creatures", "weapons"] },
  { id: "ui", label: "🖱️ كيت الواجهات", cats: ["ui", "ui", "ui", "ui", "chimes", "chimes", "alerts", "typing", "typing", "ui", "glitch", "transitions", "ui", "chimes", "foley", "foley"] },
  { id: "cinema", label: "🎞️ كيت سينمائي", cats: ["impacts", "impacts", "explosions", "risers", "risers", "ambience", "transitions", "creatures", "scifi", "music", "music", "voice", "foley", "weapons", "magic", "nature"] },
];

export function Soundboard() {
  const { pads, set, setAll } = usePads();
  const fav = useFavorites();
  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const padsRef = useRef(pads);
  const [flash, setFlash] = useState<number | null>(null);
  const [picker, setPicker] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    padsRef.current = pads;
  }, [pads]);

  const getCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };

  const load = useCallback(async (s: Sound) => {
    const have = buffers.current.get(s.id);
    if (have) return have;
    const ctx = getCtx();
    const ab = await (await fetch(`/api/audio/${s.id}`)).arrayBuffer();
    const buf = await ctx.decodeAudioData(ab);
    buffers.current.set(s.id, buf);
    return buf;
  }, []);

  // preload buffers
  useEffect(() => {
    pads.forEach((p) => {
      if (p) void load(p.sound).catch(() => {});
    });
  }, [pads, load]);

  const hit = useCallback(
    async (i: number) => {
      const p = padsRef.current[i];
      setFlash(i);
      setTimeout(() => setFlash((f) => (f === i ? null : f)), 140);
      if (!p) return;
      try {
        const ctx = getCtx();
        const buf = await load(p.sound);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
      } catch {
        /* ignore */
      }
    },
    [load],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (picker !== null || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      const i = KEYS.indexOf(e.key.toLowerCase());
      if (i >= 0) {
        e.preventDefault();
        void hit(i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hit, picker]);

  const buildKit = async (cats: string[]) => {
    setBusy(true);
    try {
      const seed = Math.random().toString(36).slice(2, 8);
      const out = await Promise.all(
        cats.map(async (c, i) => {
          const p = new URLSearchParams({ cat: c, sort: "shuffle", seed: seed + i, limit: "1", max: "3.5", min: "0.08", offset: String(Math.floor(Math.random() * 3)) });
          const j = (await (await fetch(`/api/sounds?${p}`)).json()) as { items: Sound[] };
          return j.items[0] ?? null;
        }),
      );
      setAll(out);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">🎛️ لوحة الأصوات (Soundboard)</h2>
          <p className="mt-1 text-sm text-white/55">16 باد بزمن استجابة منخفض. اضغط على الباد أو استخدم الكيبورد: 1-4 · Q-R · A-F · Z-V. الأصوات تُحفظ تلقائيًا.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {KITS.map((k) => (
            <button key={k.id} disabled={busy} onClick={() => buildKit(k.cats)} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/15 disabled:opacity-50">
              {k.label}
            </button>
          ))}
          <button
            disabled={busy}
            onClick={() => buildKit(Array.from({ length: 16 }, () => ["transitions", "impacts", "ui", "chimes", "scifi", "magic", "foley", "glitch", "retro", "risers"][Math.floor(Math.random() * 10)]))}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/85 disabled:opacity-50"
          >
            <IconShuffle size={15} /> كيت عشوائي
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2.5 sm:gap-4" dir="ltr">
        {pads.map((p, i) => {
          const hue = p ? (CAT_MAP[p.sound.category]?.hue ?? 200) : 0;
          const on = flash === i;
          return (
            <div key={i} className="relative">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  void hit(i);
                }}
                className="relative aspect-square w-full select-none overflow-hidden rounded-2xl border p-2 text-start transition-transform active:scale-95"
                style={{
                  borderColor: p ? `hsl(${hue} 80% 60% / ${on ? 1 : 0.35})` : "rgba(255,255,255,.1)",
                  background: p ? `radial-gradient(circle at 50% 30%, hsl(${hue} 85% 55% / ${on ? 0.7 : 0.2}), hsl(${hue} 60% 12% / .9))` : "rgba(255,255,255,.03)",
                  boxShadow: on ? `0 0 40px hsl(${hue} 95% 60% / .65), inset 0 0 30px hsl(${hue} 95% 70% / .3)` : "none",
                }}
              >
                <span className="absolute start-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white/70">{KEYS[i]}</span>
                {p ? (
                  <span className="absolute inset-x-2 bottom-2 block">
                    <span className="mb-0.5 block text-lg">{CAT_MAP[p.sound.category]?.icon}</span>
                    <span className="block truncate text-[11px] font-semibold leading-tight text-white" dir="auto">
                      {p.sound.name}
                    </span>
                    <span className="block text-[10px] text-white/50">{fmtDur(p.sound.duration)}</span>
                  </span>
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-xs text-white/30">فارغ</span>
                )}
              </button>
              <div className="absolute -bottom-2.5 end-1 flex gap-1">
                <button aria-label="تغيير الصوت" onClick={() => setPicker(i)} className="rounded-full border border-white/20 bg-[#0b0c12] px-2 py-0.5 text-[10px] text-white/80 hover:bg-white/15">
                  {p ? "تغيير" : "+ إضافة"}
                </button>
                {p && (
                  <button aria-label="حذف" onClick={() => set(i, null)} className="grid h-5 w-5 place-items-center rounded-full border border-white/20 bg-[#0b0c12] text-white/70 hover:bg-white/15">
                    <IconClose size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {picker !== null && (
        <Picker
          favIds={fav.ids}
          onClose={() => setPicker(null)}
          onPick={(s) => {
            set(picker, s);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function Picker({ onPick, onClose, favIds }: { onPick: (s: Sound) => void; onClose: () => void; favIds: string[] }) {
  const [q, setQ] = useState("");
  const [fromFav, setFromFav] = useState(false);
  const [items, setItems] = useState<Sound[]>([]);
  const [audio] = useState(() => (typeof Audio !== "undefined" ? new Audio() : null));

  useEffect(() => {
    const t = setTimeout(async () => {
      const p = new URLSearchParams({ limit: "40", max: "6" });
      if (q) p.set("q", q);
      if (fromFav) p.set("ids", favIds.join(","));
      const j = (await (await fetch(`/api/sounds?${p}`)).json()) as { items: Sound[] };
      setItems(j.items);
    }, 200);
    return () => clearTimeout(t);
  }, [q, fromFav, favIds]);

  useEffect(() => () => audio?.pause(), [audio]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-3xl border border-white/15 bg-[#0e0f16] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 ring-1 ring-white/10">
            <IconSearch size={16} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن صوت للباد…" className="h-11 w-full bg-transparent text-sm text-white focus:outline-none" dir="auto" />
          </div>
          <button onClick={() => setFromFav((v) => !v)} className={`rounded-xl border px-3 py-2 text-xs ${fromFav ? "border-rose-400 bg-rose-400/15 text-rose-200" : "border-white/15 text-white/70"}`}>
            ♥ المفضلة
          </button>
          <button onClick={onClose} aria-label="إغلاق" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10">
            <IconClose />
          </button>
        </div>
        <div className="space-y-1.5 overflow-y-auto">
          {items.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              onMouseEnter={() => {
                if (!audio) return;
                audio.src = `/api/audio/${s.id}`;
                audio.volume = 0.7;
                void audio.play().catch(() => {});
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-start transition hover:bg-white/10"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white" dir="auto">
                  {s.name}
                </span>
                <span className="block truncate text-xs text-white/45" dir="auto">
                  {CAT_MAP[s.category]?.icon} {s.nameAr}
                </span>
              </span>
              <span className="text-xs text-white/40" dir="ltr">
                {fmtDur(s.duration)}
              </span>
            </button>
          ))}
          {items.length === 0 && <div className="p-8 text-center text-sm text-white/40">لا نتائج</div>}
        </div>
        <p className="mt-2 text-center text-[11px] text-white/35">مرّر الماوس على أي صوت لمعاينته</p>
      </div>
    </div>
  );
}
