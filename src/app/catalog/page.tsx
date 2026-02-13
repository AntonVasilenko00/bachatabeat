"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getSongs, getAllBreakdowns, loadSeedIfNeeded } from "@/lib/storage";
import { exportAll } from "@/lib/export";
import type { Song, Breakdown } from "@/types";

export default function CatalogPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [breakdowns, setBreakdowns] = useState<Record<string, Breakdown>>({});
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      await loadSeedIfNeeded();
      setSongs(getSongs());
      setBreakdowns(getAllBreakdowns());
      setLoaded(true);
    }
    init();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Song Catalog</h1>
            <p className="text-sm text-zinc-400">
              {songs.length} song{songs.length !== 1 ? "s" : ""} in your
              catalog
            </p>
          </div>
          <div className="flex gap-2">
            {songs.length > 0 && (
              <button
                onClick={() => exportAll()}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Export All to JSON
              </button>
            )}
            <Link
              href="/"
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black transition-colors hover:bg-zinc-200"
            >
              + Add Song
            </Link>
          </div>
        </div>

        {/* Search */}
        {songs.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or artist..."
              className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500"
            />
          </div>
        )}

        {/* Song grid */}
        {!loaded ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-zinc-800/50"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center">
            <div className="text-4xl">🎵</div>
            <p className="text-zinc-400">
              {search ? "No songs match your search." : "No songs yet."}
            </p>
            {!search && (
              <Link
                href="/"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Add your first song
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((song) => {
              const bd = breakdowns[song.id];
              const hasBpm = bd?.bpm && bd.bpm > 0;
              const eventCount =
                (bd?.countChanges?.length ?? 0) + (bd?.markers?.length ?? 0);

              return (
                <Link
                  key={song.id}
                  href={`/song/${song.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  {/* Album art */}
                  {song.albumArt ? (
                    <Image
                      src={song.albumArt}
                      alt={song.title}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xl">
                      🎵
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white group-hover:text-zinc-100">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {song.artist}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {hasBpm ? (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          {bd.bpm} BPM
                        </span>
                      ) : null}
                      {eventCount > 0 ? (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          {eventCount} event{eventCount !== 1 ? "s" : ""}
                        </span>
                      ) : !hasBpm ? (
                        <span className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500">
                          No breakdown yet
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
