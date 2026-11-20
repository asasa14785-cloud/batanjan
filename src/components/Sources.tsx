"use client";
import { useState } from "react";
import { CATEGORIES, REPOS } from "@/lib/categories";
import { fmtDur, fmtNum, fmtSize, type Stats } from "@/lib/types";
import { IconLink } from "./Icons";

type Props = { stats: Stats | null; onVideo: (slug: string) => void; onRepo: (id: string) => void; onCategory: (id: string) => void };

export function Sources({ stats, onVideo, onRepo, onCategory }: Props) {
  const [vq, setVq] = useState("");
  if (!stats) return <div className="p-10 text-center text-white/50">جارٍ التحميل…</div>;
  const repoStat = Object.fromEntries(stats.repos.map((r) => [r.id, r]));
  const max = Math.max(...stats.categories.map((c) => c.count));
  const videos = stats.videos.filter((v) => !vq || (v.title + " " + v.creator).toLowerCase().includes(vq.toLowerCase()));

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-white">📦 المستودعات التي تم تنزيلها ودمجها</h2>
        <p className="mt-1 text-sm text-white/55">تم البحث في GitHub واختيار المستودعات ذات التراخيص المفتوحة فقط (CC0 / MIT)، ثم تحليل كل ملف صوتي وتسميته وتصنيفه آليًا.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {REPOS.map((r) => {
            const st = repoStat[r.id];
            return (
              <div key={r.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white" dir="auto">
                      {r.ar}
                    </h3>
                    <a href={r.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline" dir="ltr">
                      <IconLink size={12} /> {r.title}
                    </a>
                  </div>
                  <div className="text-end">
                    <div className="text-2xl font-bold tabular-nums text-white" dir="ltr">
                      {fmtNum(st?.count ?? 0)}
                    </div>
                    <div className="text-[11px] text-white/45">صوت</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">{r.blurb}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-200">{r.license}</span>
                  {st && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/60" dir="ltr">
                      {(st.seconds / 60).toFixed(0)} min · {fmtSize(st.bytes)}
                    </span>
                  )}
                  <button onClick={() => onRepo(r.id)} className="ms-auto rounded-full bg-white px-3 py-1 font-semibold text-black hover:bg-white/85">
                    تصفح أصواتها
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-7 text-amber-100/80">
          ⚠️ <b>ملاحظة عن الحقوق:</b> أصوات الفيديوهات تخص صُنّاعها الأصليين (الموسيقى غالبًا من Mixkit/غيرها) واستُخرجت للمرجعية والاستخدام الشخصي. أما مؤثرات Kenney وOpenGameArt وFreesound
          فهي CC0 ويمكن استخدامها تجاريًا بلا إسناد. مستودع better-sfx تم استبعاده لأن ترخيصه يمنع إعادة التوزيع.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">📊 توزيع التصنيفات</h2>
        <div className="mt-5 grid gap-x-8 gap-y-2 md:grid-cols-2">
          {stats.categories.map((c) => {
            const def = CATEGORIES.find((d) => d.id === c.id);
            return (
              <button key={c.id} onClick={() => onCategory(c.id)} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 text-start transition hover:bg-white/5">
                <span className="w-44 shrink-0 truncate text-sm text-white/80">
                  {def?.icon} {def?.ar ?? c.id}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full transition-all group-hover:brightness-125" style={{ width: `${(c.count / max) * 100}%`, background: `hsl(${def?.hue ?? 200} 90% 62%)` }} />
                </span>
                <span className="w-14 text-end text-xs tabular-nums text-white/55" dir="ltr">
                  {fmtNum(c.count)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">🎬 الفيديوهات ({fmtNum(stats.videos.length)})</h2>
            <p className="mt-1 text-sm text-white/55">كل فيديو تم تنزيله وفصل صوته — اضغط على أي فيديو لعرض أصواته ومقاطعه.</p>
          </div>
          <input value={vq} onChange={(e) => setVq(e.target.value)} placeholder="ابحث في الفيديوهات…" className="h-10 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50" dir="auto" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {videos.map((v) => (
            <button key={v.slug} onClick={() => onVideo(v.slug)} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-start transition hover:-translate-y-0.5 hover:border-white/30">
              <div className="relative aspect-video overflow-hidden bg-black/40">
                {v.poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.poster} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                )}
                <span className="absolute bottom-1.5 end-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white" dir="ltr">
                  {v.count} sounds
                </span>
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-[13px] font-semibold leading-5 text-white" dir="auto">
                  {v.title}
                </div>
                <div className="mt-1 truncate text-[11px] text-white/45" dir="ltr">
                  @{v.creator} · {fmtDur(v.seconds)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">🗂️ الحزم ({fmtNum(stats.packs.length)})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.05] text-xs text-white/50">
              <tr>
                <th className="px-4 py-3 text-start">الحزمة</th>
                <th className="px-4 py-3 text-start">الترخيص</th>
                <th className="px-4 py-3 text-end">الأصوات</th>
              </tr>
            </thead>
            <tbody>
              {stats.packs.slice(0, 120).map((p) => (
                <tr key={p.repo + p.pack} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 text-white/85" dir="auto">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-cyan-300 hover:underline">
                        {p.pack}
                      </a>
                    ) : (
                      p.pack
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white/50" dir="auto">
                    {p.license}
                  </td>
                  <td className="px-4 py-2.5 text-end tabular-nums text-white/70" dir="ltr">
                    {fmtNum(p.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
