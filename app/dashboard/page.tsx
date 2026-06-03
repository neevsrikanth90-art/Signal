import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ProjectsClient from "./projects-client";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: projects } = await admin
    .from("projects")
    .select("id, name, api_key, created_at, feedback(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <ProjectsClient projects={projects ?? []} />;
}
