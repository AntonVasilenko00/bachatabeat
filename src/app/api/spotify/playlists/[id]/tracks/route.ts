import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as unknown as Record<string, unknown>).accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const { id: playlistId } = await params;
  if (!playlistId) {
    return NextResponse.json(
      { error: "Missing playlist id" },
      { status: 400 }
    );
  }

  const { searchParams } = request.nextUrl;
  const offset = searchParams.get("offset") ?? "0";
  const limit = searchParams.get("limit") ?? "100";

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists,album,duration_ms,uri)),total,next`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.message ?? "Spotify API error" },
        { status: res.status }
      );
    }

    const data = await res.json();

    type SpotifyTrack = {
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: { images?: Array<{ url: string }> };
      duration_ms: number;
      uri: string;
    };

    function isSpotifyTrack(t: unknown): t is SpotifyTrack {
      return (
        t != null &&
        typeof t === "object" &&
        "id" in t &&
        typeof (t as SpotifyTrack).id === "string"
      );
    }

    const tracks = (data.items as Array<{ track: unknown }>)
      .map((item) => item.track)
      .filter(isSpotifyTrack)
      .map((track) => ({
        spotifyId: track.id,
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(", ") ?? "",
        albumArt: track.album?.images?.[0]?.url ?? track.album?.images?.[1]?.url ?? "",
        durationMs: track.duration_ms ?? 0,
        uri: track.uri,
      }));

    return NextResponse.json({
      tracks,
      total: data.total as number,
      next: data.next as string | null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks" },
      { status: 500 }
    );
  }
}
