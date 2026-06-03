import { createBrowserClient } from "@supabase/ssr";

function normalizeUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
