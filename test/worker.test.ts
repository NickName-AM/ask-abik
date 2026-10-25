import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PRIMARY_MODEL } from "../src/answer";
import worker, { dayKey, gatewayOptions } from "../src/index";

const testEnv = { ...env, ASK_TOKEN: "test-token", DAILY_LIMIT: "3", MAX_QUESTION_CHARS: "50" };
const auth = { authorization: "Bearer test-token", "content-type": "application/json", "x-visitor-ip": "1.2.3.4" };

async function ask(body: unknown, headers: Record<string, string> = auth, e: Env = testEnv) {
  const ctx = createExecutionContext();
  const req = new Request("https://w.test/ask", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
  const res = await worker.fetch(req as Request<unknown, IncomingRequestCfProperties>, e, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await env.ASK_KV.delete(dayKey());
});

describe("gatewayOptions", () => {
  it("reads the id and TTL from vars, and turns off on an empty id", () => {
    expect(gatewayOptions({ ...testEnv, AI_GATEWAY_ID: "ask", AI_CACHE_TTL: "60" })).toEqual({ id: "ask", cacheTtl: 60, metadata: { app: "ask-abik" } });
    expect(gatewayOptions({ ...testEnv, AI_GATEWAY_ID: "" })).toBeUndefined();
  });
});

describe("fetch handler", () => {
  it("answers GET / with a health check", async () => {
    const res = await worker.fetch(new Request("https://w.test/") as Request<unknown, IncomingRequestCfProperties>, testEnv, createExecutionContext());
    expect(await res.json()).toEqual({ name: "ask-abik", ok: true });
  });

  it("refuses without the token, or with the wrong one", async () => {
    expect((await ask({ question: "hi" }, { "content-type": "application/json" })).status).toBe(401);
    expect((await ask({ question: "hi" }, { ...auth, authorization: "Bearer nope" })).status).toBe(401);
  });

  it("rejects bad, empty and too-long questions", async () => {
    expect((await ask("not json")).status).toBe(400);
    expect((await ask({ question: "   " })).status).toBe(400);
    expect((await ask({ question: 42 })).status).toBe(400);
    expect((await ask({ question: "x".repeat(51) })).status).toBe(400);
  });

  it("returns 429 when the per-visitor limiter says no", async () => {
    vi.spyOn(env.ASK_LIMIT, "limit").mockResolvedValue({ success: false });
    const res = await ask({ question: "hi" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "slow down" });
  });

  it("answers, counts the question, and stops at the daily cap", async () => {
    vi.spyOn(env.ASK_LIMIT, "limit").mockResolvedValue({ success: true });
    const run = vi.spyOn(env.AI, "run").mockResolvedValue({ response: "He uses Cloudflare Workers." } as never);

    const res = await ask({ question: "What is his stack?" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ answer: "He uses Cloudflare Workers." });
    expect(run.mock.calls[0]![0]).toBe(PRIMARY_MODEL);
    expect(run.mock.calls[0]![2]).toEqual({ gateway: { id: "default", cacheTtl: 86_400, metadata: { app: "ask-abik" } } });
    expect(await env.ASK_KV.get(dayKey())).toBe("1");

    await env.ASK_KV.put(dayKey(), "3");
    const capped = await ask({ question: "again" });
    expect(capped.status).toBe(429);
    expect(await capped.json()).toEqual({ error: "daily limit" });
  });

  it("returns 502 with an email pointer when both models fail", async () => {
    vi.spyOn(env.ASK_LIMIT, "limit").mockResolvedValue({ success: true });
    vi.spyOn(env.AI, "run").mockRejectedValue(new Error("down"));
    const res = await ask({ question: "hi" });
    expect(res.status).toBe(502);
    expect(((await res.json()) as { message: string }).message).toContain("maharjanebik061@gmail.com");
  });
});
