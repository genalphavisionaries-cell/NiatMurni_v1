"use client";

import type { ElementType } from "react";
import { sanitizeHtml } from "@/lib/sanitize-cms-html";
import { cn } from "@/lib/utils";

type SafeCmsHtmlProps = {
  html: string | null | undefined;
  className?: string;
  /** Wrapper element; avoid `p` if `html` may contain block-level tags. */
  as?: ElementType;
};

/**
 * Renders sanitized CMS HTML. Use for TipTap / rich text fields only.
 */
export function SafeCmsHtml({ html, className, as: Tag = "div" }: SafeCmsHtmlProps) {
  const safeHtml = sanitizeHtml(html);
  if (!safeHtml.trim()) return null;
  return <Tag className={cn("cms-html", className)} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
