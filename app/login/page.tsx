"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    console.log("attempting sign in...");
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("sign in result:", { data, authError });

    if (authError) {
      console.log("auth error:", authError.message);
      setError(authError.message);
      setLoading(false);
    } else {
      console.log("success, redirecting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="relative flex min-h-full flex-col bg-gradient-to-b from-[#0c1222] via-zinc-950 to-black text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden
      />

      {/* Nav */}
      <header className="relative border-b border-white/[0.04] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium tracking-widest text-zinc-500 uppercase transition hover:text-zinc-400"
          >
            Signal
          </Link>
          <Link
            href="/signup"
            className="text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            Get started →
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-center text-3xl font-bold leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Welcome back.
            </span>
          </h1>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-zinc-400 underline-offset-2 transition hover:text-zinc-200 hover:underline"
            >
              Get started
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
