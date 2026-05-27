"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "loading" | "success" | "duplicate" | "error";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus("loading");

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("early_access_signups")
        .insert({ email: trimmed });

      if (error) {
        if (error.code === "23505") {
          setStatus("duplicate");
          return;
        }
        throw error;
      }

      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="early-access" className="mt-20 scroll-mt-8">
      <p className="mb-4 text-xs font-medium tracking-wider text-zinc-500 uppercase">
        Early access
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle" && status !== "loading") {
              setStatus("idle");
            }
          }}
          disabled={status === "loading"}
          className="h-14 flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-6 text-base text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition-colors placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.05] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Get Early Access"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-4 text-sm text-emerald-400/90" role="status">
          You&apos;re on the list. We&apos;ll be in touch soon.
        </p>
      )}
      {status === "duplicate" && (
        <p className="mt-4 text-sm text-zinc-500" role="status">
          That email is already signed up.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-400/90" role="status">
          Something went wrong. Please try again.
        </p>
      )}
    </section>
  );
}
