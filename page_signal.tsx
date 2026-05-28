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

        {/* ── Live demo ─────────────────────────────────────────── */}
        <div className="mt-20">
          <p className="mb-1 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Live demo
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">
            Signal is running on this page right now.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Interact with the mock app below — hesitate, rage-click, or walk away mid-form. When Signal detects confusion, it asks one question. That answer goes straight to the founder.
          </p>

          {/* Mock app UI */}
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
            <p className="mb-4 text-xs font-medium tracking-widest text-zinc-500 uppercase">
              Mock app — Acme SaaS
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Work email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Company name
                </label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Team size
                </label>
                <select className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-400 outline-none focus:border-indigo-500/50">
                  <option value="">Select…</option>
                  <option>Just me</option>
                  <option>2–10</option>
                  <option>11–50</option>
                  <option>50+</option>
                </select>
              </div>
              <button
                type="button"
                className="mt-1 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Start free trial
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600">
            Try typing something then clicking away, or clicking the same spot a few times fast.
          </p>
        </div>

        {/* ── How the insight lands ──────────────────────────────── */}
        <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            What you get
          </p>
          <div className="space-y-4">
            {[
              { emoji: "🔍", title: "One question, perfect timing", body: "Signal fires when confusion peaks — not randomly. Users answer because it feels helpful, not intrusive." },
              { emoji: "📬", title: "Insights land in one place", body: "Every response shows up in your dashboard with the page, trigger type, and what the user was trying to do." },
              { emoji: "⚡", title: "Two lines to install", body: "Paste a script tag and call Signal.init(). Works on any web app. No SDK, no config file, no build step." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Embed snippet preview */}
          <div className="mt-6 rounded-lg bg-black/40 p-4 font-mono text-xs text-zinc-400">
            <span className="text-zinc-600">&lt;!-- paste before &lt;/body&gt; --&gt;</span>
            <br />
            <span className="text-indigo-400">&lt;script</span>{" "}
            <span className="text-sky-400">src</span>
            <span className="text-zinc-400">=</span>
            <span className="text-emerald-400">&quot;https://signal-ashy-delta.vercel.app/signal.js&quot;</span>
            <span className="text-indigo-400">&gt;&lt;/script&gt;</span>
            <br />
            <span className="text-indigo-400">&lt;script&gt;</span>
            <br />
            {"  "}
            <span className="text-sky-400">Signal</span>
            <span className="text-zinc-400">.init({"{"}</span>
            <span className="text-emerald-400"> projectId</span>
            <span className="text-zinc-400">:</span>
            <span className="text-emerald-400"> &quot;your-project&quot; </span>
            <span className="text-zinc-400">{"}"});</span>
            <br />
            <span className="text-indigo-400">&lt;/script&gt;</span>
          </div>
        </div>

        <p className="mt-16 text-center text-sm leading-relaxed text-zinc-500">
          Early access partners receive a private installation guide and onboarding support.
        </p>
        <EarlyAccessForm />
      </main>

      <footer className="relative border-t border-white/[0.04] px-6 py-8">
        <p className="mx-auto max-w-2xl text-center text-xs text-zinc-600">
          Signal © 2025
        </p>
      </footer>

      {/* Signal snippet — installed on this landing page */}
      <script src="/signal.js" />
      <script
        dangerouslySetInnerHTML={{
          __html: `Signal.init({ projectId: "landing-page", endpoint: "/api/signal" });`,
        }}
      />
    </div>
  );
}
