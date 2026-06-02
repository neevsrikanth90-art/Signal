import { NextRequest, NextResponse } from "next/server";
import { checkSupabaseEnv, createAdminClient } from "@/lib/supabase/admin";

const VALID_TRIGGERS = new Set(["idle", "rage_click", "manual"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status: number) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

function apiKeyPreview(key: string): string {
  return key.length <= 8 ? `${key.slice(0, 4)}…` : `${key.slice(0, 8)}…`;
}

function logError(label: string, error: unknown) {
  if (error instanceof Error) {
    console.error(label, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return;
  }
  console.error(label, error);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

async function notifySlack(
  webhookUrl: string,
  payload: {
    trigger: string;
    pageUrl: string;
    message: string;
    projectName: string | null;
  },
) {
  const text = [
    "*New Signal feedback*",
    `*Trigger:* ${payload.trigger}`,
    `*Page:* ${payload.pageUrl || "(unknown)"}`,
    payload.projectName ? `*Project:* ${payload.projectName}` : null,
    `*Message:*\n${payload.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `New Signal feedback (${payload.trigger})`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "New Signal feedback", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Trigger:*\n${payload.trigger}` },
            {
              type: "mrkdwn",
              text: `*Page:*\n${payload.pageUrl || "—"}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${payload.message}`,
          },
        },
      ],
      // Fallback for webhooks that ignore blocks
      attachments: [{ text, color: "#6366f1" }],
    }),
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const trigger = typeof body.trigger === "string" ? body.trigger.trim() : "";
  const pageUrl =
    typeof body.pageUrl === "string" ? body.pageUrl.trim() : null;

  if (!apiKey || !message || !VALID_TRIGGERS.has(trigger)) {
    return json({ error: "Missing or invalid apiKey, message, or trigger" }, 400);
  }

  console.info("[ingest] request", {
    apiKey: apiKeyPreview(apiKey),
    trigger,
    pageUrl: pageUrl ?? "(none)",
    messageLength: message.length,
  });

  const envCheck = checkSupabaseEnv();
  if (!envCheck.ok) {
    console.error("[ingest] supabase env check failed:", envCheck.error);
    return json({ error: "Missing Supabase env vars" }, 500);
  }

  let supabase;

  try {
    supabase = createAdminClient();
  } catch (clientError) {
    logError("[ingest] supabase client init failed", clientError);
    return json({ error: "Missing Supabase env vars" }, 500);
  }

  let project: {
    id: string;
    name: string | null;
    slack_webhook_url: string | null;
  } | null;

  try {
    const { data, error: projectError } = await supabase
      .from("projects")
      .select("id, name, slack_webhook_url")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (projectError) {
      console.error("[ingest] project lookup failed", {
        apiKey: apiKeyPreview(apiKey),
        code: projectError.code,
        message: projectError.message,
        details: projectError.details,
        hint: projectError.hint,
      });
      return json({ error: "Database error" }, 500);
    }

    project = data;
  } catch (lookupError) {
    logError("[ingest] project lookup threw", lookupError);
    return json({ error: "Database error" }, 500);
  }

  if (!project) {
    console.warn("[ingest] no project for apiKey", {
      apiKey: apiKeyPreview(apiKey),
    });
    return json({ error: "Invalid API key" }, 401);
  }

  try {

    const { error: insertError } = await supabase.from("feedback").insert({
      project_id: project.id,
      message,
      trigger,
      page_url: pageUrl,
    });

    if (insertError) {
      console.error("[ingest] feedback insert failed", {
        projectId: project.id,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return json({ error: "Could not save feedback" }, 500);
    }

    if (project.slack_webhook_url) {
      try {
        await notifySlack(project.slack_webhook_url, {
          trigger,
          pageUrl: pageUrl ?? "",
          message,
          projectName: project.name,
        });
      } catch (slackError) {
        logError("[ingest] slack webhook failed", slackError);
      }
    }

    return json({ ok: true }, 200);
  } catch (error) {
    logError("[ingest] unhandled error", error);
    return json({ error: "Internal server error" }, 500);
  }
}
