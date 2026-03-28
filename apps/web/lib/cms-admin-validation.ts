/** Strip tags for required-text checks on TipTap HTML values. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasRichText(html: string): boolean {
  return stripHtml(html).length > 0;
}

/** Empty string is valid (optional field). */
export function isValidHttpOrRelativeUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (t.startsWith("/") || t.startsWith("./")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidHttpOrRelativeUrlRequired(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return isValidHttpOrRelativeUrl(t);
}
