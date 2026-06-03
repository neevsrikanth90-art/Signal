import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function normalizeUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — session refresh handled by proxy.
          }
        },
      },
    },
  );
}
