/**
 * POST /api/feedback
 *
 * Persist an in-app feedback submission from the dashboard Feedback panel
 * (/app?tab=feedback). Authenticated creators only.
 *
 * Auth:    sb-*-auth-token cookie (worker-auth).
 * Request: JSON { topic: "bug"|"idea"|"other", title: string, body: string,
 *                 contact_ok?: boolean }
 * Response: { ok: true } on success; 400 on validation; 401 on missing auth;
 *           500 on env misconfig / persistence failure.
 *
 * Story: F-FEEDBACK-001 (tadaify-app#56 follow-up).
 */

import type { Route } from "./+types/api.feedback";
import { extractAccessToken, resolveUserId } from "~/lib/worker-auth";

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export const TITLE_MAX_LENGTH = 200;
export const BODY_MAX_LENGTH = 5000;
const TOPICS = ["bug", "idea", "other"] as const;
type Topic = (typeof TOPICS)[number];

interface FeedbackInput {
  topic: Topic;
  title: string;
  body: string;
  contact_ok: boolean;
}

export function validateFeedbackBody(
  body: unknown,
): { ok: true; data: FeedbackInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.topic !== "string" || !TOPICS.includes(b.topic as Topic)) {
    return { ok: false, error: "topic must be one of bug, idea, other" };
  }
  if (typeof b.title !== "string") {
    return { ok: false, error: "title must be a string" };
  }
  const title = b.title.trim();
  if (title.length === 0 || title.length > TITLE_MAX_LENGTH) {
    return { ok: false, error: `title must be 1–${TITLE_MAX_LENGTH} characters` };
  }
  if (typeof b.body !== "string") {
    return { ok: false, error: "body must be a string" };
  }
  const text = b.body.trim();
  if (text.length === 0 || text.length > BODY_MAX_LENGTH) {
    return { ok: false, error: `body must be 1–${BODY_MAX_LENGTH} characters` };
  }
  const contact_ok = b.contact_ok === undefined ? true : b.contact_ok === true;

  return { ok: true, data: { topic: b.topic as Topic, title, body: text, contact_ok } };
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateFeedbackBody(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const userId = await resolveUserId(accessToken, supabaseUrl, serviceKey);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/feedback`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      topic: validated.data.topic,
      title: validated.data.title,
      body: validated.data.body,
      contact_ok: validated.data.contact_ok,
    }),
  });

  if (!insertRes.ok) {
    const detail = await insertRes.text();
    return Response.json({ error: "Persist failed", detail }, { status: 500 });
  }

  return Response.json({ ok: true });
}
