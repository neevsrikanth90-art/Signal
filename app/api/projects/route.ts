import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function json(data: unknown, status: number) {
  return NextResponse.json(data, { status });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("id, name, api_key, created_at, feedback(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return json({ error: "Database error" }, 500);

  return json(data, 200);
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return json({ error: "Project name is required" }, 400);

  const apiKey = `sk_live_${randomBytes(16).toString("hex")}`;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({ name, api_key: apiKey, user_id: user.id })
    .select("id, name, api_key, created_at")
    .single();

  if (error) {
    console.error("[api/projects] insert failed", error);
    return json({ error: "Failed to create project" }, 500);
  }

  return json(data, 201);
}
