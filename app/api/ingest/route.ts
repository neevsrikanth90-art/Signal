import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

const TRIGGER_EMOJI: Record<string, string> = {
  rage_click: "🔴",
  idle: "🟡",
  manual: "💬",
};

async function notifyEmail(
  to: string,
  payload: {
    trigger: string;
    pageUrl: string;
    message: string;
    timestamp: string;
  },
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[ingest] RESEND_API_KEY not set — skipping email");
    return;
  }

  const resend = new Resend(resendKey);
  const emoji = TRIGGER_EMOJI[payload.trigger] ?? "📩";
  const pageDisplay = payload.pageUrl || "(unknown page)";

  await resend.emails.send({
    from: "Signal <signal@pathfindersai.co>",
    to,
    subject: `Signal: user got stuck on ${pageDisplay}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  <h2 style="margin-top:0;">User got stuck on your site</h2>
  <table style="border-collapse:collapse;width:100%;">
    <tr>
      <td style="padding:8px 0;color:#555;width:120px;">Trigger</td>
      <td style="padding:8px 0;">${emoji} ${payload.trigger}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#555;">Page</td>
      <td style="padding:8px 0;word-break:break-all;">${pageDisplay}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#555;vertical-align:top;">Message</td>
      <td style="padding:8px 0;">${payload.message}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#555;">Time</td>
      <td style="padding:8px 0;">${payload.timestamp}</td>
    </tr>
  </table>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="font-size:12px;color:#999;margin:0;">Sent by Signal — user feedback intelligence</p>
</body>
</html>`,
  });
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
  const emoji = TRIGGER_EMOJI[payload.trigger] ?? "📩";
  const text = [
    "*New Signal feedback*",
    `*Trigger:* ${emoji} ${payload.trigger}`,
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
            { type: "mrkdwn", text: `*Trigger:*\n${emoji} ${payload.trigger}` },
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
    notification_email: string | null;
  } | null;

  try {
    const { data, error: projectError } = await supabase
      .from("projects")
      .select("id, name, slack_webhook_url, notification_email")
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

    const timestamp = new Date().toISOString();

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

    if (project.notification_email) {
      try {
        await notifyEmail(project.notification_email, {
          trigger,
          pageUrl: pageUrl ?? "",
          message,
          timestamp,
        });
      } catch (emailError) {
        logError("[ingest] email notification failed", emailError);
      }
    }

    return json({ ok: true }, 200);
  } catch (error) {
    logError("[ingest] unhandled error", error);
    return json({ error: "Internal server error" }, 500);
  }
}
