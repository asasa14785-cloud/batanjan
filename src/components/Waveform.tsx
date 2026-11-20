"use client";
import { useEffect, useRef } from "react";
import { useProgress } from "@/lib/store";

type Props = {
  peaks: number[];
  progress?: number;
  hue: number;
  height?: number;
  onSeek?: (frac: number) => void;
  className?: string;
  bars?: number;
};

export function Waveform({ peaks, progress = 0, hue, height = 40, onSeek, className = "", bars }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth;
      const h = height;
      if (!w) return;
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const n = bars ?? Math.max(16, Math.min(peaks.length * 3, Math.floor(w / 4)));
      const gap = 2;
      const bw = Math.max(1.5, w / n - gap);
      const done = `hsl(${hue} 95% 64%)`;
      const todo = `hsla(${hue} 30% 80% / 0.28)`;
      for (let i = 0; i < n; i++) {
        const pos = (i / n) * peaks.length;
        const a = peaks[Math.floor(pos)] ?? 0;
        const b = peaks[Math.min(peaks.length - 1, Math.floor(pos) + 1)] ?? a;
        const v = (a + (b - a) * (pos % 1)) / 100;
        const bh = Math.max(2, v * (h - 2));
        // LTR waveform even in RTL page: time flows left -> right
        const x = i * (bw + gap);
        ctx.fillStyle = i / n < progress ? done : todo;
        ctx.beginPath();
        ctx.roundRect(x, (h - bh) / 2, bw, bh, bw / 2);
        ctx.fill();
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [peaks, progress, hue, height, bars]);

  return (
    <canvas
      ref={ref}
      dir="ltr"
      className={`block w-full ${onSeek ? "cursor-pointer" : ""} ${className}`}
      style={{ height }}
      onClick={(e) => {
        if (!onSeek) return;
        const r = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientX - r.left) / r.width);
      }}
    />
  );
}

/** Waveform that follows the global player progress for a given sound id */
export function LiveWaveform({ id, ...rest }: Omit<Props, "progress"> & { id: string }) {
  const p = useProgress(id);
  return <Waveform {...rest} progress={p} />;
}
