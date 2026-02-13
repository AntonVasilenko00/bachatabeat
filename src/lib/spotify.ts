// ── Spotify Web Playback SDK helpers ────────────────────────────────────

declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

/** Load the Spotify Web Playback SDK script if not already loaded */
export function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  });
}

/** Create and connect a Spotify player instance */
export async function createPlayer(
  token: string,
  name: string = "BachataBeat Player"
): Promise<Spotify.Player> {
  await loadSpotifySDK();

  const player = new window.Spotify.Player({
    name,
    getOAuthToken: (cb) => cb(token),
    volume: 0.5,
  });

  return player;
}

/** Parse a Spotify track URL or URI and return the track ID */
export function parseSpotifyTrackId(input: string): string | null {
  // Handle: spotify:track:XXXXXX
  const uriMatch = input.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Handle: https://open.spotify.com/track/XXXXXX?...
  const urlMatch = input.match(
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/
  );
  if (urlMatch) return urlMatch[1];

  return null;
}

/** Format milliseconds to mm:ss */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
