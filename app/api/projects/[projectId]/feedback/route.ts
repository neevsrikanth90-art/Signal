import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function json(data: unknown, status: number) {
  return NextResponse.json(data, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient();

  // Verify project belongs to user before returning feedback
  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) return json({ error: "Not found" }, 404);

  const { data, error } = await admin
    .from("feedback")
    .select("id, message, trigger, page_url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return json({ error: "Database error" }, 500);

  return json(data, 200);
}
