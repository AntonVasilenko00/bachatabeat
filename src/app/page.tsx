"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import SpotifyPlaylistPicker from "@/components/SpotifyPlaylistPicker";
import type { PlaylistTrack } from "@/components/SpotifyPlaylistPicker";
import { parseSpotifyTrackId } from "@/lib/spotify";
import { saveSong } from "@/lib/storage";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const handleAddSong = async () => {
    setError("");

    const trackId = parseSpotifyTrackId(url.trim());
    if (!trackId) {
      setError("Please enter a valid Spotify track URL or URI.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/spotify/track?id=${trackId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch track.");
        return;
      }

      const song = {
        id: uuidv4(),
        spotifyId: data.spotifyId,
        title: data.title,
        artist: data.artist,
        albumArt: data.albumArt,
        durationMs: data.durationMs,
        addedAt: new Date().toISOString(),
      };

      saveSong(song);
      router.push(`/song/${song.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrackFromPlaylist = (track: PlaylistTrack) => {
    const song = {
      id: uuidv4(),
      spotifyId: track.spotifyId,
      title: track.title,
      artist: track.artist,
      albumArt: track.albumArt,
      durationMs: track.durationMs,
      addedAt: new Date().toISOString(),
    };
    saveSong(song);
    router.push(`/song/${song.id}`);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-3 sm:px-4">
        {/* Hero */}
        <section className="flex flex-col items-center pt-12 sm:pt-24 pb-10 sm:pb-16 text-center">
          <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-xl sm:text-2xl font-bold text-white shadow-xl shadow-rose-500/25">
            B
          </div>
          <h1 className="mb-2 sm:mb-3 text-3xl sm:text-5xl font-bold tracking-tight text-white">
            BachataBeat
          </h1>
          <p className="mb-2 text-base sm:text-lg text-zinc-400 max-w-lg px-2">
            Annotate bachata songs with counts, breaks, accents, and sections.
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md px-2">
            Made by dancers, for dancers. Paste a Spotify link to get started.
          </p>
        </section>

        {/* Add song */}
        <section className="mx-auto max-w-lg px-1">
          {session ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                  placeholder="Paste Spotify track URL or URI..."
                  className="flex-1 min-w-0 rounded-xl border border-zinc-700 bg-zinc-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500"
                />
                <button
                  onClick={handleAddSong}
                  disabled={loading || !url.trim()}
                  className="shrink-0 rounded-xl bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-black" />
                  ) : (
                    "Add"
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-zinc-800" aria-hidden />
                <span className="text-[10px] sm:text-xs text-zinc-600">or</span>
                <span className="flex-1 h-px bg-zinc-800" aria-hidden />
              </div>

              <button
                type="button"
                onClick={() => setShowPlaylistPicker(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-colors"
              >
                <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" />
                </svg>
                Choose from my playlists
              </button>

              <SpotifyPlaylistPicker
                isOpen={showPlaylistPicker}
                onClose={() => setShowPlaylistPicker(false)}
                onSelectTrack={handleSelectTrackFromPlaylist}
              />

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <p className="text-center text-[10px] sm:text-xs text-zinc-600 truncate">
                Example: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <p className="text-sm text-zinc-400">
                Connect your Spotify account to add songs and start annotating.
              </p>
              <button
                onClick={() => signIn("spotify")}
                className="flex items-center gap-2 rounded-xl bg-[#1DB954] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:bg-[#1ed760] hover:shadow-green-500/30"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Sign in with Spotify
              </button>
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="mt-12 flex justify-center">
          <a
            href="/catalog"
            className="text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
          >
            Browse the catalog &rarr;
          </a>
        </section>
      </main>
    </div>
  );
}
