"use client";
import { useSyncExternalStore } from "react";
import type { Sound } from "./types";

/* ------------------------------------------------------------------ */
/* Player store: one shared <audio>, coarse state + a fine progress feed */
/* ------------------------------------------------------------------ */

export type PlayerState = {
  current: Sound | null;
  playing: boolean;
  loop: boolean;
  autoNext: boolean;
  volume: number;
  queueLength: number;
};

let audio: HTMLAudioElement | null = null;
let queue: Sound[] = [];
let state: PlayerState = { current: null, playing: false, loop: false, autoNext: true, volume: 0.9, queueLength: 0 };
let progress = 0;
let currentTime = 0;
const stateListeners = new Set<() => void>();
const progressListeners = new Set<() => void>();
let raf = 0;

function emit() {
  state = { ...state };
  stateListeners.forEach((l) => l());
}
function emitProgress() {
  progressListeners.forEach((l) => l());
}

function tick() {
  if (audio && state.playing) {
    const d = audio.duration && Number.isFinite(audio.duration) ? audio.duration : state.current?.duration || 1;
    currentTime = audio.currentTime;
    progress = Math.min(1, currentTime / d);
    emitProgress();
    raf = requestAnimationFrame(tick);
  }
}

function ensureAudio() {
  if (audio || typeof window === "undefined") return audio;
  audio = new Audio();
  audio.preload = "auto";
  audio.volume = state.volume;
  audio.addEventListener("play", () => {
    state.playing = true;
    emit();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  });
  audio.addEventListener("pause", () => {
    state.playing = false;
    emit();
  });
  audio.addEventListener("ended", () => {
    state.playing = false;
    progress = 1;
    emitProgress();
    emit();
    if (state.loop && audio) {
      audio.currentTime = 0;
      void audio.play();
    } else if (state.autoNext) next();
  });
  return audio;
}

export const player = {
  play(s: Sound, list?: Sound[]) {
    const a = ensureAudio();
    if (!a) return;
    if (list) queue = list;
    if (state.current?.id === s.id) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    state.current = s;
    state.queueLength = queue.length;
    progress = 0;
    currentTime = 0;
    emitProgress();
    a.src = `/api/audio/${s.id}`;
    a.currentTime = 0;
    void a.play().catch(() => {});
    emit();
  },
  /** play from the start even if already current */
  restart(s: Sound, list?: Sound[]) {
    const a = ensureAudio();
    if (!a) return;
    if (state.current?.id === s.id) {
      a.currentTime = 0;
      void a.play();
    } else this.play(s, list);
  },
  toggle() {
    const a = ensureAudio();
    if (!a || !state.current) return;
    if (a.paused) void a.play();
    else a.pause();
  },
  seek(frac: number) {
    const a = ensureAudio();
    if (!a || !state.current) return;
    const d = a.duration && Number.isFinite(a.duration) ? a.duration : state.current.duration;
    a.currentTime = Math.max(0, Math.min(1, frac)) * d;
    progress = frac;
    emitProgress();
  },
  next,
  prev() {
    const idx = queue.findIndex((q) => q.id === state.current?.id);
    if (idx > 0) this.play(queue[idx - 1]);
    else if (audio) audio.currentTime = 0;
  },
  setVolume(v: number) {
    state.volume = v;
    if (audio) audio.volume = v;
    emit();
  },
  setLoop(v: boolean) {
    state.loop = v;
    emit();
  },
  setAutoNext(v: boolean) {
    state.autoNext = v;
    emit();
  },
  stop() {
    if (audio) audio.pause();
  },
};

function next() {
  const idx = queue.findIndex((q) => q.id === state.current?.id);
  if (idx >= 0 && idx < queue.length - 1) player.play(queue[idx + 1]);
}

const serverState: PlayerState = { current: null, playing: false, loop: false, autoNext: true, volume: 0.9, queueLength: 0 };

export function usePlayer(): PlayerState {
  return useSyncExternalStore(
    (cb) => {
      stateListeners.add(cb);
      return () => stateListeners.delete(cb);
    },
    () => state,
    () => serverState,
  );
}

/** progress (0..1) of the given sound id, 0 when it is not the current one */
export function useProgress(id: string): number {
  return useSyncExternalStore(
    (cb) => {
      progressListeners.add(cb);
      return () => progressListeners.delete(cb);
    },
    () => (state.current?.id === id ? progress : 0),
    () => 0,
  );
}

export function getCurrentTime() {
  return currentTime;
}

/* ------------------------------------------------------------------ */
/* Persistent localStorage-backed stores (favorites, soundboard pads)  */
/* ------------------------------------------------------------------ */

function persistentStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
  };
  return {
    get() {
      load();
      return value;
    },
    set(v: T) {
      load();
      value = v;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
    subscribe(cb: () => void) {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          loaded = false;
          load();
          cb();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    initial,
  };
}

const favStore = persistentStore<string[]>("sl:favorites", []);

export function useFavorites() {
  const ids = useSyncExternalStore(favStore.subscribe, favStore.get, () => favStore.initial);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => favStore.set(ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]),
    add: (list: string[]) => favStore.set([...new Set([...list, ...ids])]),
    clear: () => favStore.set([]),
  };
}

export type Pad = { sound: Sound } | null;
const padStore = persistentStore<Pad[]>("sl:pads", Array.from({ length: 16 }, () => null));

export function usePads() {
  const pads = useSyncExternalStore(padStore.subscribe, padStore.get, () => padStore.initial);
  return {
    pads,
    set: (i: number, s: Sound | null) => padStore.set(pads.map((p, j) => (j === i ? (s ? { sound: s } : null) : p))),
    setAll: (list: (Sound | null)[]) => padStore.set(Array.from({ length: 16 }, (_, i) => (list[i] ? { sound: list[i]! } : null))),
  };
}
