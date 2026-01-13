# Geo + Desktop Redirect — Cloudflare Worker (Template)

Universal Cloudflare Worker template that redirects **desktop users**
from a specific **country** to a target URL.

No hardcoded domains. Fully configurable via Worker Variables.

---

## Configuration (required)

Set the following **Worker Variables** in Cloudflare Dashboard:

- `TARGET_COUNTRY` — two-letter country code (e.g. SK)
- `TARGET_URL` — full URL to redirect to
- `REDIRECT_STATUS` — 301 or 302 (optional, default: 302)

If variables are not set, the Worker does nothing.

---

## Bot whitelist (SEO & AI safe)

The Worker **does not redirect** search engine bots and AI crawlers.
This prevents SEO issues and allows AI systems to index original content.

### Default whitelisted bots

Included by default (no configuration required):

- **Google**: googlebot, google-inspectiontool, google-site-verification
- **Bing / Microsoft**: bingbot, adidxbot
- **OpenAI / ChatGPT**: gptbot, chatgpt, openai
- **Google Gemini / DeepMind**: gemini, google-extended
- **Anthropic (Claude)**: claudebot, anthropic
- **Common AI crawlers**: ai, llm, crawler

### Custom whitelist (optional)

You can override the default whitelist by adding a Worker Variable:

```text
WHITELIST_USER_AGENTS = ["googlebot","bingbot","gptbot","perplexitybot"]
```

- Type: **Text**
- Value must be a valid JSON array
- If set, this list **replaces** the default whitelist

---

## Deploy via Cloudflare Dashboard (recommended)

1. Workers & Pages → Create application → Worker
2. Import from GitHub (use this template)
3. Deploy
4. Settings → Domains & Routes → add route: `example.com/*`
5. Settings → Variables → add:
```
TARGET_COUNTRY = SK
TARGET_URL = https://example.com/landing/
REDIRECT_STATUS = 302
```
6. Failure mode: **Fail open (proceed)**

---

## Notes

- Redirect applies only to **HTML navigation**
- Mobile users are not redirected
- Target page itself is excluded (no redirect loop)
- Safe for SEO and UX