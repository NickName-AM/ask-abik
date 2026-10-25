# ask-abik

A small Cloudflare Worker that answers visitors' questions about Abik Maharjan, using his CV.
The portfolio's "Ask about me" form calls it server-side.

- Model: `@cf/qwen/qwen3-30b-a3b-fp8` (thinking off) on Workers AI, falling back to `@cf/zai-org/glm-4.7-flash`.
- Knowledge: `profile/cv.md`, inserted in full into `profile/system-prompt.md` at `{{CV}}`. No RAG.
- Cost: Workers Free plan only. One question is about 8-10 neurons out of 10,000/day.

## API

`POST /ask` with `Authorization: Bearer $ASK_TOKEN` and an optional `x-visitor-ip` header.

```json
{ "question": "What is his main stack?" }
```

| Status | Body |
| --- | --- |
| 200 | `{ "answer": "..." }` |
| 400 | empty, non-string, or longer than `MAX_QUESTION_CHARS` |
| 401 | missing or wrong token |
| 429 | `{ "error": "slow down" }` (5/min per visitor) or `{ "error": "daily limit" }` |
| 502 | both models failed; `message` points to email |

`GET /` returns `{ "name": "ask-abik", "ok": true }`.

## Limits

- `ASK_LIMIT` rate-limit binding: 5 questions per 60 s per visitor IP.
- `DAILY_LIMIT` (default 300): approximate daily cap, counted in KV under `count:YYYY-MM-DD`.
  It leaves room in the shared 10k neurons/day for `api-changelog-watcher`.

## AI Gateway

Model calls go through AI Gateway (free on every plan), set by `AI_GATEWAY_ID`
(default `"default"`, which Cloudflare creates on the first request). You get request
analytics and logs in the dashboard, and caching: the same question within
`AI_CACHE_TTL` (default 1 day) is answered from the cache without using neurons.
After editing `profile/cv.md`, cached answers can be up to that old.
Set `AI_GATEWAY_ID = ""` to call Workers AI directly.

Gateway logs include each visitor's question and the answer. Turn logging off in the
gateway's settings if you would rather not keep them.

## Develop

```sh
npm install
cp .dev.vars.example .dev.vars   # set ASK_TOKEN
npm test && npm run typecheck
npm run dev                      # AI runs remotely and uses real free neurons
curl -X POST localhost:8787/ask -H "authorization: Bearer change-me" \
  -H 'content-type: application/json' -d '{"question":"What is his main stack?"}'
```

To update what the bot knows, edit `profile/cv.md` and redeploy.

## Deploy

```sh
npx wrangler login
npx wrangler secret put ASK_TOKEN
npx wrangler deploy               # creates the KV namespace, prints the workers.dev URL
```

Then set `ASK_WORKER_URL` and `ASK_TOKEN` in the portfolio's Vercel project.
