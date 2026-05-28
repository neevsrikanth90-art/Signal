import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
  const trigger = typeof body.trigger === "string" ? body.trigger.trim() : "";
  const response = typeof body.response === "string" ? body.response.trim() : null;
  const context = (body.context && typeof body.context === "object" ? body.context : {}) as Record<string, unknown>;

  if (!projectId || !trigger) {
    return NextResponse.json({ error: "Missing projectId or trigger" }, { status: 400 });
  }

  const { error } = await supabase.from("signal_events").insert({
    project_id: projectId,
    trigger,
    response,
    url: typeof context.url === "string" ? context.url : null,
    path: typeof context.path === "string" ? context.path : null,
    title: typeof context.title === "string" ? context.title : null,
  });

  if (error) {
    console.error("[Signal] Supabase error:", error.message);
    return NextResponse.json({ error: "Could not save event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}