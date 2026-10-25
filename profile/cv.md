# Abik Maharjan — CV

## Summary

Abik Maharjan is a Backend Developer based in Kathmandu, Nepal (timezone UTC+5:45). He builds backend systems on Cloudflare: many small serverless services, each with one job and no server to keep alive. He currently works as a contract backend developer for Apex Suite AI, working on social media integrations on Cloudflare Workers. He is open to work and interesting problems, especially backend, serverless and Cloudflare Workers projects.

## Contact

- Email: maharjanebik061@gmail.com (the fastest way to reach him)
- Website: https://www.abikmaharjan.com.np
- GitHub: https://github.com/NickName-AM (username NickName-AM)
- LinkedIn: https://www.linkedin.com/in/abik-maharjan/
- Location: Kathmandu, Nepal

## Skills

- Languages: JavaScript, TypeScript, Python, Go, SQL, Dart, HTML/CSS. Also some C, C++ and Java from coursework.
- Cloudflare: Workers, Queues, Durable Objects, KV, R2, Hyperdrive, Service Bindings, Secrets Store, Cron Triggers, Workers AI, Wrangler.
- Data and auth: PostgreSQL, Supabase, JWT verification, OAuth 2.0.
- Platform APIs: Meta Graph API (Facebook, Instagram), TikTok API.
- Backend frameworks: Cloudflare Workers, Django, Django REST Framework.
- Mobile and frontend: Flutter (Bloc, Cubit), React, Next.js.
- Testing and CI: Vitest with `@cloudflare/vitest-pool-workers`, Django tests, GitHub Actions, Postman collections.
- Tools: Git, Linux, Docker, VS Code, Claude Code, MCP (Model Context Protocol).

## Work Experience

### Backend Developer (Contract) — Apex Suite AI
July 2026 – present · Remote

Abik works as an independent contractor on backend services for Apex Suite AI, built on Cloudflare Workers. His work covers integrations with Facebook, Instagram and TikTok, in these general areas:

- **Account connection:** connecting social accounts through OAuth.
- **Webhooks:** receiving events from social platforms.
- **Automations:** reacting to activity such as comments and messages.
- **Publishing:** scheduling and publishing posts.
- **History and analytics:** post history and metrics.

## Personal Projects

All are on GitHub at https://github.com/NickName-AM.

- **api-changelog-watcher** (TypeScript, Cloudflare Worker). Tracks public API changes from Meta, TikTok and LinkedIn. On a cron it fetches changelogs and status pages, diffs them against the last copy in KV, has Workers AI explain each change in plain English, and saves the result to Supabase. His website's /watch page shows the results (https://www.abikmaharjan.com.np/watch/). Runs entirely on free tiers.
- **Portfolio website** (Next.js, TypeScript, Supabase). His personal site at https://www.abikmaharjan.com.np with a blog, projects and the API change watcher.
- **claude-ssh-daemon** (Go). An MCP server that lets Claude Code use a persistent SSH session. The human owns the SSH ControlMaster session and the daemon only borrows it, so the AI agent never holds SSH credentials.
- **gopull** (Go). A command-line tool that finds every git repository under a folder and pulls them all, one by one or in parallel. Uses fast-forward-only pulls so nothing gets merged by accident.
- **GoFiles** (Go). A command-line tool that generates realistic test files, folders and fixtures (JSON, CSV, large sparse files, directory trees) and can undo everything it created. No dependencies outside the Go standard library.
- **fclean** (Python). A command-line tool that scaffolds Flutter Clean Architecture feature folders and Dart boilerplate for Bloc, Cubit, Riverpod or GetX.
- **Jatra** (Flutter, Dart). An app about the Newar festivals of the Kathmandu Valley (Indra Jatra, Mha Puja, Yomari Punhi, Bisket Jatra, Rato Machhindranath, Sithi Nakha), with stories, countdowns and hand-painted animated scenes drawn with CustomPainter and no animation libraries.
- **Kinbech** (Python, Django). A marketplace for buying and selling new and second-hand goods. Server-rendered, works without JavaScript, image pipeline that converts photos to WebP and strips EXIF data, 80 tests.
- **Bloggy** (Python, Django). A small blogging platform with a Markdown editor and live preview, autosaving drafts, scheduled posts, claps, bookmarks, threaded replies, full-text search, and RSS/Atom feeds.
- **Rick & Morty Explorer** (React Native, Expo, TypeScript). A mobile app for browsing Rick and Morty characters, using TanStack Query and Zustand.
- **Flutter apps**: a coffee shop ordering app, an e-commerce app, a blog app, and a todo app with a Django REST Framework backend using JWT authentication.
- **Other**: a MERN-stack e-commerce site, a Django site with miscellaneous tools, LeetCode solutions, CTF solvers, and code for all 8 semesters of the BSc CSIT program (csitcodes).

## Interests

Serverless and edge computing, distributed systems built from small services, developer tools and command-line tools, Flutter apps, security (CTFs, rarely).

## Quick Facts

- Name: Abik Maharjan
- Role: Backend Developer
- Current work: Contract backend developer at Apex Suite AI
- Main stack: Cloudflare Workers, JavaScript/TypeScript, PostgreSQL, Go, Python
- Location: Kathmandu, Nepal
- Available for: backend, serverless and Cloudflare Workers work
- Best contact: maharjanebik061@gmail.com
