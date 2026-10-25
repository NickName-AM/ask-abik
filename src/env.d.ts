// Secrets are not in wrangler.toml, so `wrangler types` can't see them.
// Set them with `wrangler secret put`, or in .dev.vars for local dev.

interface AskSecrets {
  /** Shared with the portfolio's ASK_TOKEN. */
  ASK_TOKEN?: string;
}

interface Env extends AskSecrets {}

declare namespace Cloudflare {
  interface Env extends AskSecrets {}
}

// Bundled as text by the [[rules]] in wrangler.toml.
declare module "*.md" {
  const content: string;
  export default content;
}
