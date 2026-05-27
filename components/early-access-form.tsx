"use client";

import { FormEvent, useState } from "react";

function formatErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return "Unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [record.error, record.message, record.details, record.hint]
      .filter((part): part is string => typeof part === "string" && part.length > 0);

    if (parts.length > 0) {
      const code =
        typeof record.code === "string" ? ` (${record.code})` : "";
      return `${parts.join(" — ")}${code}`;
    }
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        console.log("Early access signup error:", { status: response.status, data });
        setErrorMessage(formatErrorMessage(data));
        setStatus("error");
        return;
      }

      setEmail("");
      setStatus("success");
    } catch (error) {
      console.log("Early access signup error:", error);
      setErrorMessage(formatErrorMessage(error));
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
              setErrorMessage(null);
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
          You&apos;re on the list!
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="mt-4 text-sm text-red-400/90" role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
