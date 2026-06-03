import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full bg-[#0c1222]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-52 flex-col border-r border-white/[0.06] bg-black/50 backdrop-blur-sm">
        <div className="flex h-14 shrink-0 items-center border-b border-white/[0.06] px-5">
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            Signal
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Projects
          </Link>
          <Link
            href="/dashboard/settings"
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Settings
          </Link>
        </nav>

        <div className="shrink-0 border-t border-white/[0.06] p-2">
          <LogoutButton email={user.email} />
        </div>
      </aside>

      {/* Main */}
      <main className="ml-52 flex min-h-full flex-1 flex-col">{children}</main>
    </div>
  );
}
