"use client";
import { useEffect, useState } from "react";
import { DEFAULT_FILTERS, type Filters, type Stats } from "@/lib/types";
import { player, useFavorites, usePlayer } from "@/lib/store";
import { Hero } from "./Hero";
import { Library } from "./Library";
import { PlayerBar } from "./PlayerBar";
import { Soundboard } from "./Soundboard";
import { Sources } from "./Sources";

type Tab = "library" | "board" | "sources";

export function App() {
  const [tab, setTab] = useState<Tab>("library");
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const { current } = usePlayer();
  const fav = useFavorites();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setTab("library");
        setTimeout(() => document.getElementById("search-box")?.focus(), 30);
      } else if (e.code === "Space" && !typing && tab !== "board") {
        e.preventDefault();
        player.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab]);

  const goLibrary = (f: Partial<Filters>) => {
    setFilters({ ...DEFAULT_FILTERS, ...f });
    setTab("library");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "library", label: "المكتبة" },
    { id: "board", label: "لوحة الأصوات" },
    { id: "sources", label: "المصادر والفيديوهات" },
  ];

  return (
    <div className="min-h-screen" style={{ paddingBottom: current ? 96 : 24 }}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07080c]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-lg shadow-[0_0_24px_rgba(217,70,239,.45)]">🔊</div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-extrabold text-white">SonicVault</div>
              <div className="text-[10px] text-white/45">مكتبة الأصوات الضخمة</div>
            </div>
          </div>
          <nav className="flex gap-1 rounded-full bg-white/[0.06] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition sm:px-4 ${tab === t.id ? "bg-white text-black" : "text-white/65 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={() => goLibrary({ favOnly: true })}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 transition hover:bg-white/10"
            >
              ♥ <span className="tabular-nums">{fav.ids.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {tab === "library" && (
          <div className="space-y-8">
            <Hero stats={stats} onExplore={() => document.getElementById("library")?.scrollIntoView({ behavior: "smooth" })} />
            <Library stats={stats} filters={filters} setFilters={setFilters} />
          </div>
        )}
        {tab === "board" && <Soundboard />}
        {tab === "sources" && (
          <Sources
            stats={stats}
            onVideo={(slug) => goLibrary({ video: slug })}
            onRepo={(id) => goLibrary({ repos: [id] })}
            onCategory={(id) => goLibrary({ cats: [id] })}
          />
        )}
      </main>
      <PlayerBar />
    </div>
  );
}
