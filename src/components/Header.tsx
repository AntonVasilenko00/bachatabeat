"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 text-sm font-bold text-white shadow-lg shadow-rose-500/20">
            B
          </div>
          <span className="text-lg font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            BachataBeat
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Catalog
          </Link>

          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-zinc-400">
                  {session.user?.name ?? "Connected"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("spotify")}
              className="flex items-center gap-2 rounded-lg bg-[#1DB954] px-3.5 py-1.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:bg-[#1ed760] hover:shadow-green-500/30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Sign in with Spotify
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
