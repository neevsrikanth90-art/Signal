import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import FeedbackFeed from "./feedback-feed";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, name, api_key")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) notFound();

  const { data: feedback } = await admin
    .from("feedback")
    .select("id, message, trigger, page_url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const items = feedback ?? [];

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <span>←</span>
          <span>All projects</span>
        </Link>
        <div className="flex items-end gap-4">
          <h1 className="text-xl font-semibold text-zinc-100">
            {project.name ?? "Untitled project"}
          </h1>
          <span className="mb-0.5 text-sm text-zinc-500">
            {items.length} {items.length === 1 ? "response" : "responses"}
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1">
        <FeedbackFeed items={items} />
      </div>
    </div>
  );
}
