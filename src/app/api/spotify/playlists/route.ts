import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as unknown as Record<string, unknown>).accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") ?? "0";
  const limit = searchParams.get("limit") ?? "50";

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
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

    const playlists = (data.items as Array<{
      id: string;
      name: string;
      images: Array<{ url: string }>;
      tracks: { total: number };
    }>).map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url ?? "",
      trackCount: p.tracks?.total ?? 0,
    }));

    return NextResponse.json({
      playlists,
      total: data.total as number,
      next: data.next as string | null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
