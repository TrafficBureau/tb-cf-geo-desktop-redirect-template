/**
 * Geo + Desktop Redirect — Cloudflare Worker TEMPLATE
 *
 * Redirects DESKTOP users from a specific country
 * to a target URL, excluding the target page itself.
 *
 * Configuration via Worker Variables:
 * - TARGET_COUNTRY   (e.g. "SK")
 * - TARGET_URL       (e.g. "https://example.com/landing/")
 * - REDIRECT_STATUS  (301 or 302)
 */

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isMobileClient(req) {
  // Prefer Client Hints
  const ch = req.headers.get("sec-ch-ua-mobile");
  if (ch) return ch.trim() === "?1";

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const mobileRegex =
    /(iphone|ipod|ipad|android|blackberry|bb\d+|meego).+mobile|avantgo|bada\/|brew|blazer|compal|elaine|fennec|hiptop|iemobile|kindle|midp|mmp|mobile.+firefox|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android(?!.*tablet)/;
  const tabletRegex =
    /(ipad|tablet|kindle|silk|playbook|nexus 7|nexus 9|sm-t\d+)/;

  return mobileRegex.test(ua) || tabletRegex.test(ua);
}

function isHtmlNavigation(req) {
  const accept = req.headers.get("accept") || "";
  return (
    accept === "" ||
    accept.includes("text/html") ||
    accept.includes("application/xhtml+xml")
  );
}

export default {
  async fetch(request, env) {
    const TARGET_COUNTRY = (env.TARGET_COUNTRY || "").toUpperCase();
    const TARGET_URL = env.TARGET_URL;
    const REDIRECT_STATUS = Number(env.REDIRECT_STATUS || 302) || 302;

    // If not configured — do nothing
    if (!TARGET_COUNTRY || !TARGET_URL) {
      return fetch(request);
    }

    const url = new URL(request.url);

    if (!["GET", "HEAD"].includes(request.method)) {
      return fetch(request);
    }

    if (!isHtmlNavigation(request)) {
      return fetch(request);
    }

    const target = new URL(TARGET_URL);

    // Prevent redirect loop
    const reqPath = normalizePath(url.pathname);
    const targetPath = normalizePath(target.pathname);
    const isTargetPage =
      url.host === target.host && reqPath === targetPath;

    if (isTargetPage) {
      return fetch(request);
    }

    const country =
      (request.cf?.country ||
        request.headers.get("cf-ipcountry") ||
        "").toUpperCase();

    const isDesktop = !isMobileClient(request);

    if (isDesktop && country === TARGET_COUNTRY) {
      return Response.redirect(TARGET_URL, REDIRECT_STATUS);
    }

    return fetch(request);
  },
};