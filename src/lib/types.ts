export type Sound = {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  kind: string;
  tags: string[];
  repo: string;
  pack: string;
  creator: string | null;
  license: string;
  attribution: string | null;
  sourceUrl: string | null;
  videoSlug: string | null;
  videoTitle: string | null;
  videoUrl: string | null;
  posterUrl: string | null;
  segStart: number | null;
  segEnd: number | null;
  duration: number;
  size: number;
  peaks: number[];
  peakDb: number;
  rmsDb: number;
  brightness: number;
  flatness: number;
  attackMs: number;
};

export type Stats = {
  totals: { total: number; seconds: number; bytes: number; videos: number; packs: number; creators: number };
  categories: { id: string; count: number; seconds: number }[];
  repos: { id: string; count: number; seconds: number; bytes: number }[];
  packs: { pack: string; repo: string; license: string; url: string | null; count: number }[];
  videos: { slug: string; title: string; creator: string; poster: string | null; url: string | null; count: number; seconds: number }[];
};

export type Filters = {
  q: string;
  cats: string[];
  repos: string[];
  kind: string;
  dur: "" | "xs" | "s" | "m" | "l";
  sort: string;
  video: string;
  similar: string;
  favOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = { q: "", cats: [], repos: [], kind: "", dur: "", sort: "relevance", video: "", similar: "", favOnly: false };

export function fmtDur(s: number) {
  if (s < 1) return `${Math.round(s * 1000)}ms`;
  if (s < 60) return `${s.toFixed(s < 10 ? 2 : 1)}s`;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function fmtClock(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function fmtSize(b: number) {
  if (b > 1e9) return `${(b / 1e9).toFixed(2)} GB`;
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(b / 1e3))} KB`;
}

export function fmtNum(n: number) {
  return n.toLocaleString("en-US");
}
