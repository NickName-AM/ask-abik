# Abik's Blog — Notes

His blog is at https://www.abikmaharjan.com.np/blog/ (RSS: https://www.abikmaharjan.com.np/blog/feed.xml). Below are the main points of each post, newest first. For the full details, share the post's link.

## The Queue Is Not the Hard Part (11 October 2026)
https://www.abikmaharjan.com.np/blog/the-queue-is-not-the-hard-part/
Opinions on producer-consumer and event-driven systems, learned from building a notification system.
- Producers should be "dumb": events describe facts (what happened, who, what it touched), not who to notify. One consumer owns the "who gets told" logic.
- Commit first, then announce: write the data, then enqueue off the request path, so a queue hiccup never fails the user's action.
- Queues deliver at least once, so consumer writes must be idempotent (a stable key from your own data plus a unique constraint, "on conflict do nothing").
- Don't retry malformed messages; log and drop them. Retry only transient errors, and ack per message.
- Deploy order: create the queue, deploy the consumer, then the producers. Keep payloads small because fanout multiplies them. Read fresh data for anything a user just changed.
- Don't go event-driven if you need the answer immediately or have one producer and one consumer in the same codebase.

## Cloudflare Workers, Properly (30 September 2026)
https://www.abikmaharjan.com.np/blog/cloudflare-workers-properly/
Part 1 of his Cloudflare Starter Series, built around an example scheduled-posting API called Postly.
- A Worker is a short-lived function with no ambient access; everything it can reach comes through bindings declared in wrangler config.
- Route with a simple table, use one response envelope, throw typed errors and catch them once; put auth in the router, not in each handler.
- Log structured JSON with a request ID, since logs are the only debugger.
- The most common bug: un-awaited promises are cancelled when the response returns. Every promise must be awaited or passed to ctx.waitUntil.
- Avoid mutable module-scope state; know the three tiers of secrets; use service bindings for Worker-to-Worker calls; use Queues for slow or flaky work and decide ack vs retry by whether the work is idempotent.
- Workers are the wrong tool for CPU-heavy work, persistent filesystems or large in-memory data.

## Your AI Agent Should Never Hold Your SSH Keys (19 September 2026)
https://www.abikmaharjan.com.np/blog/your-ai-agent-should-never-hold-your-ssh-keys/
About building claude-ssh-daemon, a Go MCP server that lets Claude work on a server without touching credentials.
- The human starts an OpenSSH ControlMaster session; the daemon only reuses it, so it holds no keys and opens no network ports. Running "ssh -O exit" is an instant kill switch.
- Disabled capabilities are never registered as tools, so the model cannot even see them.
- Server output is treated as untrusted input and scanned for prompt injection; the scanner warns rather than blocks and never echoes the matched text.
- Bugs he hit: port forwards that "refused to die" (fixed by using "ssh -O forward/cancel"), and a restricted PATH that stopped socat from starting.
- His view: the key question in agent infrastructure is the smallest, most human-understandable boundary you can draw around the model.

## Ctrl-C Is a Feature (5 September 2026)
https://www.abikmaharjan.com.np/blog/ctrl-c-is-a-feature/
Why a tool's interrupt behaviour matters as much as its happy path, using his tools gopull and outreach (a desktop mail-merge app).
- Report "failed", "canceled" and "never started" as different states, and use exit code 130 for interrupts.
- Go's signal.NotifyContext stops listening after the first signal, so interactive CLIs need a handler where a second Ctrl-C force-quits.
- Stop child processes with SIGTERM first (cmd.Cancel and cmd.WaitDelay) so git doesn't leave lock files.
- Put guarantees in the database (a UNIQUE constraint so nobody is emailed twice), commit immediately, and make cancel interrupt waits.
- Small tools face the same problems as distributed systems, just on one machine.

## Your Go Docker Image Is 900MB and You Know It (16 August 2026)
https://www.abikmaharjan.com.np/blog/your-go-docker-image-is-900mb-and-you-know-it/
A guide to multi-stage Docker builds for Go.
- Building with the full Go image gives about 960MB; a multi-stage build with CGO_ENABLED=0 drops it to about 20MB on Alpine or about 12MB on scratch.
- His recommended runtime base is gcr.io/distroless/static, which includes CA certificates, timezone data and a nonroot user.
- Copy go.mod and go.sum first to cache module downloads; use -ldflags "-s -w" to shrink the binary and -X to stamp the version.
- The best reasons to use multi-stage builds: source code and secrets never reach production, and the image has a much smaller attack surface.

## Docker cheatsheet (9 August 2026)
https://www.abikmaharjan.com.np/blog/docker-cheatsheet/
His notes from learning Docker: basic image and container commands, networks, volumes and bind mounts, Docker Compose commands, and common Dockerfile instructions.
