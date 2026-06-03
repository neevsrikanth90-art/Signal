"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton({ email }: { email?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-1">
      {email && (
        <p className="truncate px-2 text-[11px] text-zinc-600">{email}</p>
      )}
      <button
        onClick={handleLogout}
        className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
      >
        Log out
      </button>
    </div>
  );
}
