"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { loadSpotifySDK, formatTime } from "@/lib/spotify";

interface SpotifyPlayerProps {
  spotifyUri?: string;
  onTimeUpdate?: (positionMs: number) => void;
  onDuration?: (durationMs: number) => void;
  children?: (controls: PlayerControls) => ReactNode;
}

export interface PlayerControls {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  deviceId: string | null;
  ready: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (ms: number) => void;
  formattedPosition: string;
  formattedDuration: string;
}

export default function SpotifyPlayer({
  spotifyUri,
  onTimeUpdate,
  onDuration,
  children,
}: SpotifyPlayerProps) {
  const { data: session } = useSession();
  const accessToken = (session as unknown as Record<string, unknown> | null)
    ?.accessToken as string | undefined;

  const playerRef = useRef<Spotify.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [ready, setReady] = useState(false);

  // Initialize player
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function init() {
      await loadSpotifySDK();
      if (cancelled) return;

      const player = new window.Spotify.Player({
        name: "BachataBeat Player",
        getOAuthToken: (cb) => cb(accessToken!),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        if (!cancelled) {
          setDeviceId(device_id);
          setReady(true);
        }
      });

      player.addListener("not_ready", () => {
        if (!cancelled) {
          setReady(false);
          setDeviceId(null);
        }
      });

      player.addListener("player_state_changed", (state) => {
        if (!state || cancelled) return;
        setIsPlaying(!state.paused);
        setPositionMs(state.position);
        setDurationMs(state.duration);
        onDuration?.(state.duration);
      });

      await player.connect();
      playerRef.current = player;
    }

    init();

    return () => {
      cancelled = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
      setReady(false);
      setDeviceId(null);
    };
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll position while playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(async () => {
        const state = await playerRef.current?.getCurrentState();
        if (state) {
          setPositionMs(state.position);
          onTimeUpdate?.(state.position);
        }
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, onTimeUpdate]);

  // Start playback when URI changes
  useEffect(() => {
    if (!spotifyUri || !deviceId || !accessToken) return;

    fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ uris: [spotifyUri] }),
      }
    ).catch(() => {
      // Playback start may fail silently
    });
  }, [spotifyUri, deviceId, accessToken]);

  const play = useCallback(() => playerRef.current?.resume(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);
  const togglePlay = useCallback(() => playerRef.current?.togglePlay(), []);
  const seek = useCallback(
    (ms: number) => {
      playerRef.current?.seek(ms);
      setPositionMs(ms);
      onTimeUpdate?.(ms);
    },
    [onTimeUpdate]
  );

  const controls: PlayerControls = {
    isPlaying,
    positionMs,
    durationMs,
    deviceId,
    ready,
    play,
    pause,
    togglePlay,
    seek,
    formattedPosition: formatTime(positionMs),
    formattedDuration: formatTime(durationMs),
  };

  if (!accessToken) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center text-zinc-400">
        Sign in with Spotify to use the player
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center text-zinc-400">
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-green-500" />
        <span className="ml-2">Connecting to Spotify...</span>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/refs
  return <>{children?.(controls)}</>;
}
