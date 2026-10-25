# ask-abik

A small Cloudflare Worker that answers visitors' questions about Abik Maharjan, using his CV.
The portfolio's "Ask about me" form calls it server-side.

- Model: `@cf/meta/llama-3.2-3b-instruct` on Workers AI, falling back to `@cf/zai-org/glm-4.7-flash`.
- Knowledge: `profile/cv.md`, inserted in full into `profile/system-prompt.md` at `{{CV}}`. No RAG.
- Cost: Workers Free plan only. One question is about 20 neurons out of 10,000/day.

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
