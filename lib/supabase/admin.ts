import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (client) return client;

  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) for server operations",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY — anon key cannot be used here (RLS has no public policies)",
    );
  }

  if (
    process.env.SUPABASE_ANON_KEY &&
    serviceRoleKey === process.env.SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY matches SUPABASE_ANON_KEY — use the service role secret from Supabase dashboard",
    );
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY matches NEXT_PUBLIC_SUPABASE_ANON_KEY — use the service role secret, not the anon key",
    );
  }

  console.info("[supabase/admin] client init", {
    urlHost: url.replace(/^https?:\/\//, "").split("/")[0],
    serviceRoleKeyPrefix: serviceRoleKey.slice(0, 8),
  });

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
