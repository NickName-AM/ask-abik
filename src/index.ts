import { answerQuestion, type GatewayOptions } from "./answer";

const FAILED = "Sorry, Bubluuuu couldn't answer that right now. You can email Abik at maharjanebik061@gmail.com.";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function tokenMatches(given: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  // Hash both sides so the comparison is constant-time and length-independent.
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function authorized(req: Request, env: Env): Promise<boolean> {
  if (!env.ASK_TOKEN) return false;
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") ?? "");
  return Boolean(m && (await tokenMatches(m[1]!.trim(), env.ASK_TOKEN)));
}

function intVar(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * Routes Workers AI calls through AI Gateway (free) for analytics, logs and caching.
 * An identical question within the TTL is answered from the cache and costs no neurons.
 * Set AI_GATEWAY_ID to "" to call Workers AI directly.
 */
export function gatewayOptions(env: Env): GatewayOptions | undefined {
  const id = env.AI_GATEWAY_ID?.trim();
  if (!id) return undefined;
  return { id, cacheTtl: intVar(env.AI_CACHE_TTL, 86_400), metadata: { app: "ask-abik" } };
}

export function dayKey(now = new Date()): string {
  return `count:${now.toISOString().slice(0, 10)}`;
}

async function handleAsk(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!(await authorized(req, env))) return json({ error: "unauthorized" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const raw = (body as { question?: unknown } | null)?.question;
  const question = typeof raw === "string" ? raw.trim() : "";
  if (!question) return json({ error: "empty question" }, 400);
  if (question.length > intVar(env.MAX_QUESTION_CHARS, 500)) return json({ error: "question too long" }, 400);

  const visitor = req.headers.get("x-visitor-ip")?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
  const { success } = await env.ASK_LIMIT.limit({ key: visitor });
  if (!success) return json({ error: "slow down" }, 429);

  // Approximate daily cap: KV is eventually consistent, which is fine at this scale.
  const key = dayKey();
  const used = intVar((await env.ASK_KV.get(key)) ?? undefined, 0);
  if (used >= intVar(env.DAILY_LIMIT, 300)) return json({ error: "daily limit" }, 429);
  ctx.waitUntil(env.ASK_KV.put(key, String(used + 1), { expirationTtl: 2 * 86_400 }));

  const answer = await answerQuestion(env.AI, question, gatewayOptions(env));
  if (!answer) return json({ error: "model failed", message: FAILED }, 502);
  return json({ answer });
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const path = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
    if (path === "/" && req.method === "GET") return json({ name: "ask-abik", ok: true });
    if (path === "/ask") {
      if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
      return handleAsk(req, env, ctx);
    }
    return json({ error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
