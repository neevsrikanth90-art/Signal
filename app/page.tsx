import { EarlyAccessForm } from "@/components/early-access-form";

const benefits = [
  {
    text: "Silently detects where users hesitate, rage-click, or abandon flows",
    accent: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]",
  },
  {
    text: "Pops up one lightweight question at the moment confusion happens",
    accent: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
  },
  {
    text: "Turns responses into plain-English insights in your founder dashboard",
    accent: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col bg-gradient-to-b from-[#0c1222] via-zinc-950 to-black text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-20 sm:py-28">
        <p className="mb-10 text-sm font-medium tracking-widest text-zinc-500 uppercase">
          Signal
        </p>

        <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.08]">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Know where users get stuck in your app—and ask one question at
            exactly the right moment.
          </span>
        </h1>

        <ul className="mt-14 space-y-5">
          {benefits.map((benefit) => (
            <li key={benefit.text} className="flex gap-4">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${benefit.accent}`}
                aria-hidden
              />
              <span className="text-[15px] leading-relaxed text-zinc-200">
                {benefit.text}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-center text-sm leading-relaxed text-zinc-500">
          Early access partners receive a private installation guide and
          onboarding support.
        </p>

        <EarlyAccessForm />
      </main>

      <footer className="relative border-t border-white/[0.04] px-6 py-8">
        <p className="mx-auto max-w-2xl text-center text-xs text-zinc-600">
          Signal © 2025
        </p>
      </footer>
    </div>
  );
}
