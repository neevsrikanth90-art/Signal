"use client";

import { useState } from "react";

type FeedbackItem = {
  id: string;
  message: string;
  trigger: string;
  page_url: string | null;
  created_at: string;
};

const TRIGGER_CONFIG: Record<
  string,
  { emoji: string; label: string; className: string }
> = {
  rage_click: {
    emoji: "🔴",
    label: "rage click",
    className: "bg-red-500/15 text-red-400 border-red-500/20",
  },
  idle: {
    emoji: "🟡",
    label: "idle",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  },
  manual: {
    emoji: "💬",
    label: "manual",
    className: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function truncate(str: string, len: number): string {
  return str.length <= len ? str : str.slice(0, len) + "…";
}

export default function FeedbackFeed({ items }: { items: FeedbackItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-zinc-400">No feedback yet</p>
        <p className="mt-1 text-sm text-zinc-600">
          Install the widget to get started
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.06]">
      {items.map((item) => {
        const trigger = TRIGGER_CONFIG[item.trigger] ?? {
          emoji: "📩",
          label: item.trigger,
          className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
        };
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            onClick={() => setExpandedId(isExpanded ? null : item.id)}
            className="cursor-pointer px-8 py-4 transition hover:bg-white/[0.02]"
          >
            <div className="flex items-start gap-4">
              {/* Trigger badge */}
              <span
                className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${trigger.className}`}
              >
                {trigger.emoji} {trigger.label}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">
                  {isExpanded ? item.message : truncate(item.message, 80)}
                </p>

                {isExpanded && (
                  <p className="mt-3 text-xs text-zinc-500">
                    {formatTimestamp(item.created_at)}
                  </p>
                )}

                {item.page_url && (
                  <a
                    href={item.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block truncate text-xs text-zinc-600 underline-offset-2 hover:text-zinc-400 hover:underline"
                  >
                    {item.page_url}
                  </a>
                )}
              </div>

              {/* Time */}
              <span className="shrink-0 text-xs text-zinc-600">
                {timeAgo(item.created_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
