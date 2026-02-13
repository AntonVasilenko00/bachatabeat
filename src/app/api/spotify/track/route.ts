import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as unknown as Record<string, unknown>).accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const trackId = request.nextUrl.searchParams.get("id");
  if (!trackId) {
    return NextResponse.json(
      { error: "Missing track id parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.error?.message ?? "Spotify API error" },
        { status: res.status }
      );
    }

    const track = await res.json();

    return NextResponse.json({
      spotifyId: track.id,
      title: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(", "),
      albumArt:
        track.album.images?.[0]?.url ?? track.album.images?.[1]?.url ?? "",
      durationMs: track.duration_ms,
      uri: track.uri,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
