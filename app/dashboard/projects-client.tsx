"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FeedbackCount = { count: number }[];

type Project = {
  id: string;
  name: string | null;
  api_key: string;
  created_at: string;
  feedback: FeedbackCount;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName.trim() }),
    });

    if (res.ok) {
      setShowModal(false);
      setProjectName("");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setCreateError((body as { error?: string }).error ?? "Failed to create project");
    }
    setCreating(false);
  }

  function copyScript(project: Project) {
    const snippet = `<script src="https://signal-ashy-delta.vercel.app/signal.js" data-key="${project.api_key}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const feedbackCount = (p: Project) => p.feedback?.[0]?.count ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <div>
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
            Projects
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-zinc-100">
            Your projects
          </h1>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setCreateError("");
            setProjectName("");
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          New project
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 px-8 py-6">
        {projects.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-sm text-zinc-500">No projects yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-indigo-400 underline-offset-2 hover:underline"
            >
              Create your first project →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/[0.12]"
              >
                <Link href={`/dashboard/${project.id}`} className="group flex-1">
                  <p className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                    {project.name ?? "Untitled project"}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                    <span>{feedbackCount(project)} responses</span>
                    <span>·</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </Link>

                {/* Script tag snippet */}
                <div className="mt-4 rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-zinc-500 leading-relaxed">
                  <span className="text-indigo-400">&lt;script</span>{" "}
                  <span className="text-sky-400">data-key</span>
                  <span className="text-zinc-400">=</span>
                  <span className="text-emerald-400">
                    &quot;{project.api_key}&quot;
                  </span>
                  <span className="text-indigo-400">&gt;&lt;/script&gt;</span>
                </div>

                <button
                  onClick={() => copyScript(project)}
                  className="mt-3 w-full rounded-lg border border-emerald-500/20 bg-emerald-600/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-600/20"
                >
                  {copiedId === project.id ? "✓ Copied!" : "Copy script tag"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New project modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 shadow-2xl">
            <h2 className="mb-5 text-base font-semibold text-zinc-100">
              New project
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Project name
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My App"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              {createError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {createError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
