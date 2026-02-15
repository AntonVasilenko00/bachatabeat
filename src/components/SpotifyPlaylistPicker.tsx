"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface PlaylistItem {
  id: string;
  name: string;
  image: string;
  trackCount: number;
}

export interface PlaylistTrack {
  spotifyId: string;
  title: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  uri: string;
}

interface SpotifyPlaylistPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: PlaylistTrack) => void;
}

export default function SpotifyPlaylistPicker({
  isOpen,
  onClose,
  onSelectTrack,
}: SpotifyPlaylistPickerProps) {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistItem | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState("");

  const fetchPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    setError("");
    try {
      const res = await fetch("/api/spotify/playlists?limit=50");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load playlists");
      setPlaylists(data.playlists ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load playlists");
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);

  const fetchTracks = useCallback(async (playlistId: string) => {
    setLoadingTracks(true);
    setError("");
    try {
      const res = await fetch(
        `/api/spotify/playlists/${encodeURIComponent(playlistId)}/tracks?limit=100`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load tracks");
      setTracks(data.tracks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tracks");
      setTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && playlists.length === 0 && !loadingPlaylists) {
      fetchPlaylists();
    }
  }, [isOpen, playlists.length, loadingPlaylists, fetchPlaylists]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlaylist(null);
      setTracks([]);
      setError("");
    }
  }, [isOpen]);

  const handleSelectPlaylist = (playlist: PlaylistItem) => {
    setSelectedPlaylist(playlist);
    fetchTracks(playlist.id);
  };

  const handleBack = () => {
    setSelectedPlaylist(null);
    setTracks([]);
    setError("");
  };

  const handleSelectTrack = (track: PlaylistTrack) => {
    onSelectTrack(track);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 shrink-0 border-b border-zinc-800 px-4 py-3">
          {selectedPlaylist ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              aria-label="Back to playlists"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          <h2 className="text-sm font-semibold text-white truncate flex-1">
            {selectedPlaylist ? selectedPlaylist.name : "Your playlists"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          {error ? (
            <p className="text-sm text-red-400 py-4 text-center">{error}</p>
          ) : selectedPlaylist ? (
            loadingTracks ? (
              <div className="flex justify-center py-12">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
              </div>
            ) : tracks.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">No tracks in this playlist.</p>
            ) : (
              <ul className="space-y-1">
                {tracks.map((track) => (
                  <li key={track.spotifyId}>
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(track)}
                      className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        {track.albumArt ? (
                          <Image
                            src={track.albumArt}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover h-full w-full"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{track.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                      </div>
                      <svg className="w-5 h-5 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : loadingPlaylists ? (
            <div className="flex justify-center py-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No playlists found.</p>
          ) : (
            <ul className="space-y-1">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPlaylist(playlist)}
                    className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-zinc-800/80 active:bg-zinc-800 transition-colors"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {playlist.image ? (
                        <Image
                          src={playlist.image}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-600 text-lg">
                          ♪
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{playlist.name}</p>
                      <p className="text-xs text-zinc-500">
                        {playlist.trackCount} track{playlist.trackCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <svg className="w-5 h-5 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
