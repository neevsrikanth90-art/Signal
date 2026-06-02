import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export type SupabaseEnvCheck =
  | { ok: true; url: string; serviceRoleKey: string }
  | { ok: false; error: string };

/** Normalize project URL (strip /rest/v1 and trailing slashes). */
export function normalizeSupabaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

export function checkSupabaseEnv(): SupabaseEnvCheck {
  const hasUrl = Boolean(process.env.SUPABASE_URL?.trim());
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  console.info("[supabase/admin] env vars present", {
    SUPABASE_URL: hasUrl,
    SUPABASE_SERVICE_ROLE_KEY: hasKey,
  });

  const urlRaw = process.env.SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (!urlRaw || !serviceRoleKey) {
    return { ok: false, error: "Missing Supabase env vars" };
  }

  let url: string;
  try {
    const parsed = new URL(normalizeSupabaseUrl(urlRaw));
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "Missing Supabase env vars" };
    }
    url = parsed.origin;
  } catch {
    return { ok: false, error: "Missing Supabase env vars" };
  }

  return { ok: true, url, serviceRoleKey };
}

export function createAdminClient(): SupabaseClient {
  if (client) return client;

  const env = checkSupabaseEnv();
  if (!env.ok) {
    throw new Error(env.error);
  }

  const { url, serviceRoleKey } = env;

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
