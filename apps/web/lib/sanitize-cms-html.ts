import sanitizeHtml from "sanitize-html";

const CMS_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "blockquote",
  "code",
  "pre",
  "div",
];

const styleTags = ["p", "div", "span", "h1", "h2", "h3", "h4", "li", "ul", "ol"];
const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel", "class", "title"],
  ...Object.fromEntries(styleTags.map((t) => [t, ["class", "style"]])),
};

/**
 * Sanitize CMS rich text for safe `dangerouslySetInnerHTML` (TipTap-style markup).
 */
export function sanitizeCmsHtml(dirty: string | null | undefined): string {
  if (dirty == null) return "";
  const s = String(dirty);
  if (!s.trim()) return "";
  return sanitizeHtml(s, {
    allowedTags: CMS_ALLOWED_TAGS,
    allowedAttributes,
    allowedStyles: {
      "*": {
        "text-align": [/^left$/i, /^right$/i, /^center$/i, /^justify$/i],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: attribs.target === "_blank" ? "noopener noreferrer" : attribs.rel ?? "",
        },
      }),
    },
  });
}

/** Plain text for `alt` / `aria-label` (strips tags after sanitize). */
export function cmsPlainTextForAttribute(html: string | null | undefined): string {
  const s = sanitizeCmsHtml(html ?? "");
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}
