"use client";
import { useEffect, useRef, useState } from "react";
import { fmtNum, type Stats } from "@/lib/types";

function useCountUp(target: number, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(target * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Stat({ label, value, suffix = "", dec = 0 }: { label: string; value: number; suffix?: string; dec?: number }) {
  const v = useCountUp(value);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
      <div className="text-3xl font-bold tabular-nums text-white sm:text-4xl" dir="ltr">
        {dec ? v.toFixed(dec) : fmtNum(Math.round(v))}
        <span className="text-xl text-white/50">{suffix}</span>
      </div>
      <div className="mt-1 text-xs text-white/50">{label}</div>
    </div>
  );
}

function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (t: number) => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      // flowing ribbons
      for (let r = 0; r < 5; r++) {
        ctx.beginPath();
        const hue = 280 + r * 22 + Math.sin(time * 0.3 + r) * 20;
        for (let x = 0; x <= w; x += 6) {
          const k = x / w;
          const amp = (28 + r * 14) * (0.55 + 0.45 * Math.sin(time * 0.8 + r * 1.7 + k * 3));
          const y = h * 0.62 + Math.sin(k * (5 + r) + time * (0.9 + r * 0.17)) * amp + Math.sin(k * 17 - time * 1.9 + r) * (amp * 0.22);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue} 95% 65% / ${0.5 - r * 0.07})`;
        ctx.lineWidth = 2.2 - r * 0.25;
        ctx.stroke();
      }
      // equalizer bars
      const n = Math.floor(w / 14);
      for (let i = 0; i < n; i++) {
        const k = i / n;
        const env = Math.exp(-Math.pow((k - 0.5) * 2.4, 2));
        const v = (0.25 + 0.75 * Math.abs(Math.sin(time * 2.1 + i * 0.37) * Math.sin(time * 0.7 + i * 0.11))) * env;
        const bh = 6 + v * h * 0.5;
        ctx.fillStyle = `hsla(${300 + k * 90} 90% 65% / ${0.1 + v * 0.35})`;
        ctx.beginPath();
        ctx.roundRect(i * 14 + 2, h * 0.62 - bh / 2, 8, bh, 4);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export function Hero({ stats, onExplore }: { stats: Stats | null; onExplore: () => void }) {
  const t = stats?.totals;
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a0f2e] via-[#0d1020] to-[#08121c] px-6 py-14 sm:px-12 sm:py-20">
      <div className="pointer-events-none absolute -top-40 start-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 end-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <Aurora />
      <div className="relative z-10 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> مكتبة حيّة · مصنّفة · مسمّاة بالعربي والإنجليزي
        </span>
        <h1 className="mt-5 text-4xl font-black leading-[1.15] text-white sm:text-6xl">
          مكتبة <span className="bg-gradient-to-l from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">الأصوات والمؤثرات</span> الضخمة
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
          صوت كل فيديو من مستودع <span dir="ltr" className="text-white/90">awesome-opus-5-5-motion-design</span> تم فصله وتقطيعه إلى مقاطع منفصلة وتسميتها، ومعه مستودعات
          مؤثرات مفتوحة المصدر (Kenney، OpenGameArt، وغيرها) — كل شيء بحث فوري، موجات صوتية، لوحة بادات، وتنزيل مباشر.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onExplore} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.03] active:scale-95">
            ابدأ الاستكشاف ↓
          </button>
          <a href="#sources" onClick={(e) => { e.preventDefault(); document.getElementById("tab-sources")?.click(); }} className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:bg-white/10">
            المصادر والتراخيص
          </a>
        </div>
      </div>
      <div className="relative z-10 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="صوت ومؤثر" value={t?.total ?? 0} />
        <Stat label="ساعات من الصوت" value={(t?.seconds ?? 0) / 3600} dec={1} />
        <Stat label="فيديو تم فصل صوته" value={t?.videos ?? 0} />
        <Stat label="حزمة / مجموعة" value={t?.packs ?? 0} />
      </div>
    </section>
  );
}
