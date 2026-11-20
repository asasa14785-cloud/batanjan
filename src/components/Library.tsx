"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CAT_MAP, REPOS, REPO_MAP } from "@/lib/categories";
import { player, useFavorites } from "@/lib/store";
import { DEFAULT_FILTERS, fmtNum, type Filters, type Sound, type Stats } from "@/lib/types";
import { SoundRow } from "./SoundRow";
import { IconClose, IconDownload, IconSearch, IconShuffle } from "./Icons";

const PAGE = 48;
const DURS: { id: Filters["dur"]; label: string; min?: number; max?: number }[] = [
  { id: "", label: "أي مدة" },
  { id: "xs", label: "≤ 0.5 ث", max: 0.5 },
  { id: "s", label: "0.5 – 2 ث", min: 0.5, max: 2 },
  { id: "m", label: "2 – 10 ث", min: 2, max: 10 },
  { id: "l", label: "10 ث +", min: 10 },
];
const SORTS = [
  { id: "relevance", label: "الأكثر صلة" },
  { id: "name", label: "الاسم (A-Z)" },
  { id: "short", label: "الأقصر أولًا" },
  { id: "long", label: "الأطول أولًا" },
  { id: "loud", label: "الأقوى صوتًا" },
  { id: "bright", label: "الأكثر سطوعًا" },
  { id: "dark", label: "الأكثر عمقًا" },
  { id: "shuffle", label: "عشوائي 🎲" },
];
const QUICK = ["whoosh", "impact", "click", "riser", "glitch", "coin", "footstep", "magic", "laser", "ding", "pop", "boom", "ambience", "typing", "swipe", "نقرة", "ضربة"];

type Props = { stats: Stats | null; filters: Filters; setFilters: (f: Filters | ((p: Filters) => Filters)) => void };

export function Library({ stats, filters, setFilters }: Props) {
  const [items, setItems] = useState<Sound[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState("a");
  const [q, setQ] = useState(filters.q);
  const fav = useFavorites();
  const sentinel = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const busy = useRef(false);
  const doneRef = useRef(false);
  const reqId = useRef(0);
  const [zipping, setZipping] = useState(false);

  // keep local search box in sync when filters.q is changed from outside
  useEffect(() => setQ(filters.q), [filters.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== filters.q) setFilters((p) => ({ ...p, q, similar: "" }));
    }, 250);
    return () => clearTimeout(t);
  }, [q, filters.q, setFilters]);

  const favKey = filters.favOnly ? fav.ids.join(",") : "";
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.cats.length) p.set("cat", filters.cats.join(","));
    if (filters.repos.length) p.set("repo", filters.repos.join(","));
    if (filters.kind) p.set("kind", filters.kind);
    if (filters.video) p.set("video", filters.video);
    if (filters.similar) p.set("similar", filters.similar);
    const d = DURS.find((x) => x.id === filters.dur);
    if (d?.min != null) p.set("min", String(d.min));
    if (d?.max != null) p.set("max", String(d.max));
    p.set("sort", filters.sort);
    if (filters.sort === "shuffle") p.set("seed", seed);
    if (filters.favOnly) p.set("ids", favKey);
    return p;
  }, [filters, seed, favKey]);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (busy.current && !reset) return;
      const id = ++reqId.current;
      busy.current = true;
      setLoading(true);
      if (reset) {
        offsetRef.current = 0;
        doneRef.current = false;
      }
      const p = new URLSearchParams(params);
      p.set("offset", String(offsetRef.current));
      p.set("limit", String(PAGE));
      try {
        const r = await fetch(`/api/sounds?${p}`);
        const j = (await r.json()) as { total: number; items: Sound[] };
        if (id !== reqId.current) return;
        setTotal(j.total);
        setItems((prev) => (reset ? j.items : [...prev, ...j.items]));
        offsetRef.current += j.items.length;
        if (offsetRef.current >= j.total || j.items.length === 0) doneRef.current = true;
      } catch {
        /* ignore */
      } finally {
        if (id === reqId.current) {
          busy.current = false;
          setLoading(false);
        }
      }
    },
    [params],
  );

  useEffect(() => {
    void fetchPage(true);
  }, [fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting && !doneRef.current && !busy.current) void fetchPage(false);
      },
      { rootMargin: "900px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchPage, items.length]);

  const toggle = (key: "cats" | "repos", v: string) =>
    setFilters((p) => ({ ...p, similar: "", [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }));

  const reset = () => setFilters({ ...DEFAULT_FILTERS });
  const hasFilter = filters.q || filters.cats.length || filters.repos.length || filters.kind || filters.dur || filters.video || filters.similar || filters.favOnly;
  const catCounts = useMemo(() => Object.fromEntries((stats?.categories ?? []).map((c) => [c.id, c.count])), [stats]);
  const repoCounts = useMemo(() => Object.fromEntries((stats?.repos ?? []).map((c) => [c.id, c.count])), [stats]);
  const videoTitle = stats?.videos.find((v) => v.slug === filters.video)?.title;

  const zipResults = async () => {
    setZipping(true);
    try {
      const p = new URLSearchParams(params);
      p.set("limit", "120");
      const out: string[] = [];
      for (let off = 0; off < 360 && out.length < 360; off += 120) {
        p.set("offset", String(off));
        const j = (await (await fetch(`/api/sounds?${p}`)).json()) as { items: Sound[] };
        out.push(...j.items.map((x) => x.id));
        if (j.items.length < 120) break;
      }
      const r = await fetch("/api/zip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: out.slice(0, 400) }) });
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sound-library-pack.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[270px_1fr]" id="library">
      {/* sidebar */}
      <aside className="lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-170px)] lg:self-start lg:overflow-y-auto lg:pe-1">
        <div className="mb-2 hidden text-xs font-semibold tracking-wide text-white/40 lg:block">التصنيفات</div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          <button
            onClick={() => setFilters((p) => ({ ...p, cats: [], similar: "" }))}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition ${filters.cats.length === 0 ? "bg-white text-black" : "bg-white/[0.04] text-white/75 hover:bg-white/10"}`}
          >
            <span>✦ الكل</span>
            <span className="text-xs opacity-60" dir="ltr">
              {stats ? fmtNum(stats.totals.total) : "…"}
            </span>
          </button>
          {CATEGORIES.filter((c) => catCounts[c.id]).map((c) => {
            const on = filters.cats.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle("cats", c.id)}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition ${on ? "text-black" : "bg-white/[0.04] text-white/75 hover:bg-white/10"}`}
                style={on ? { background: `hsl(${c.hue} 90% 65%)` } : undefined}
              >
                <span className="whitespace-nowrap">
                  {c.icon} {c.ar}
                </span>
                <span className="text-xs opacity-60" dir="ltr">
                  {fmtNum(catCounts[c.id])}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0">
        {/* search */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur sm:p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-black/40 px-4 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-fuchsia-400/60">
            <span className="text-white/50">
              <IconSearch size={20} />
            </span>
            <input
              id="search-box"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالعربي أو الإنجليزي… whoosh، ضربة، click، 8-bit، فيديو…"
              className="h-14 w-full bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none"
              dir="auto"
            />
            {q && (
              <button aria-label="مسح" onClick={() => setQ("")} className="text-white/50 hover:text-white">
                <IconClose size={18} />
              </button>
            )}
            <kbd className="hidden rounded-md border border-white/15 px-1.5 py-0.5 text-[11px] text-white/40 sm:block">/</kbd>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK.map((t) => (
              <button
                key={t}
                onClick={() => setQ(t)}
                className={`rounded-full border px-3 py-1 text-xs transition ${filters.q === t ? "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-200" : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <div className="flex overflow-hidden rounded-xl border border-white/10">
              {DURS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setFilters((p) => ({ ...p, dur: d.id }))}
                  className={`px-3 py-1.5 text-xs transition ${filters.dur === d.id ? "bg-white text-black" : "text-white/60 hover:bg-white/10"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="flex overflow-hidden rounded-xl border border-white/10">
              {[
                ["", "الكل"],
                ["sfx", "مؤثرات"],
                ["music", "موسيقى"],
                ["ambience", "أجواء"],
                ["voice", "أصوات"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilters((p) => ({ ...p, kind: id }))}
                  className={`px-3 py-1.5 text-xs transition ${filters.kind === id ? "bg-white text-black" : "text-white/60 hover:bg-white/10"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={filters.sort}
              onChange={(e) => {
                setSeed(Math.random().toString(36).slice(2, 8));
                setFilters((p) => ({ ...p, sort: e.target.value }));
              }}
              className="rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white/80 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSeed(Math.random().toString(36).slice(2, 8));
                setFilters((p) => ({ ...p, sort: "shuffle" }));
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            >
              <IconShuffle size={14} /> فاجئني
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, favOnly: !p.favOnly }))}
              className={`rounded-xl border px-3 py-1.5 text-xs transition ${filters.favOnly ? "border-rose-400 bg-rose-400/15 text-rose-200" : "border-white/10 text-white/70 hover:bg-white/10"}`}
            >
              ♥ المفضلة ({fav.ids.length})
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-white/35">المصدر:</span>
            {REPOS.filter((r) => repoCounts[r.id]).map((r) => (
              <button
                key={r.id}
                onClick={() => toggle("repos", r.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition ${filters.repos.includes(r.id) ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"}`}
              >
                {r.ar} <span className="opacity-50">· {fmtNum(repoCounts[r.id])}</span>
              </button>
            ))}
          </div>
        </div>

        {/* status line */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
            <span className="font-semibold text-white" dir="ltr">
              {total == null ? "…" : fmtNum(total)}
            </span>{" "}
            صوت
            {filters.similar && <Chip onClear={() => setFilters((p) => ({ ...p, similar: "" }))}>مشابه لصوت محدد</Chip>}
            {filters.video && <Chip onClear={() => setFilters((p) => ({ ...p, video: "" }))}>🎬 {videoTitle ?? filters.video}</Chip>}
            {filters.cats.map((c) => (
              <Chip key={c} onClear={() => toggle("cats", c)}>
                {CAT_MAP[c]?.icon} {CAT_MAP[c]?.ar}
              </Chip>
            ))}
            {filters.repos.map((c) => (
              <Chip key={c} onClear={() => toggle("repos", c)}>
                {REPO_MAP[c]?.ar}
              </Chip>
            ))}
            {hasFilter && (
              <button onClick={reset} className="text-xs text-fuchsia-300 underline-offset-4 hover:underline">
                مسح الكل
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => items.length && player.play(items[0], items)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/20"
            >
              ▶ شغّل النتائج بالتتابع
            </button>
            <button
              onClick={zipResults}
              disabled={zipping || !items.length}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/85 disabled:opacity-50"
            >
              <IconDownload size={14} /> {zipping ? "جارٍ التجهيز…" : "تنزيل ZIP"}
            </button>
          </div>
        </div>

        {/* list */}
        <div className="mt-3 space-y-2">
          {items.map((s) => (
            <SoundRow
              key={s.id}
              sound={s}
              queue={items}
              onSearchTag={(t) => setFilters((p) => ({ ...DEFAULT_FILTERS, sort: p.sort === "shuffle" ? "relevance" : p.sort, q: t }))}
              onSimilar={(x) => {
                setFilters({ ...DEFAULT_FILTERS, similar: x.id, sort: "relevance" });
                document.getElementById("library")?.scrollIntoView({ behavior: "smooth" });
              }}
              onVideo={(slug) => setFilters({ ...DEFAULT_FILTERS, video: slug })}
              onCategory={(id) => setFilters({ ...DEFAULT_FILTERS, cats: [id] })}
            />
          ))}
          {!loading && items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-white/50">
              <div className="mb-2 text-4xl">🔇</div>
              {filters.favOnly && fav.ids.length === 0 ? "لا توجد مفضلات بعد — اضغط ♥ على أي صوت لحفظه هنا." : "لا نتائج. جرّب كلمة أخرى أو امسح الفلاتر."}
            </div>
          )}
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: items.length ? 2 : 8 }).map((_, i) => (
                <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          )}
          <div ref={sentinel} className="h-10" />
        </div>
      </section>
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 py-0.5 ps-2.5 pe-1 text-xs text-white/80">
      {children}
      <button onClick={onClear} aria-label="إزالة" className="grid h-4 w-4 place-items-center rounded-full hover:bg-white/20">
        <IconClose size={11} />
      </button>
    </span>
  );
}
