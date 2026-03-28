import sanitizeHtmlLib from "sanitize-html";

const CMS_ALLOWED_TAGS = ["p", "strong", "em", "ul", "li", "br", "h1", "h2", "h3"];
const CMS_ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {};

/**
 * Strictly sanitize CMS rich text for safe `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (dirty == null) return "";
  const s = String(dirty);
  if (!s.trim()) return "";
  return sanitizeHtmlLib(s, {
    allowedTags: CMS_ALLOWED_TAGS,
    allowedAttributes: CMS_ALLOWED_ATTRIBUTES,
  });
}

/** Backward-compatible alias used by existing imports. */
export const sanitizeCmsHtml = sanitizeHtml;

/** Plain text for `alt` / `aria-label` (strips tags after sanitize). */
export function cmsPlainTextForAttribute(html: string | null | undefined): string {
  const s = sanitizeHtml(html ?? "");
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}
