/**
 * Safe string utilities to prevent null/undefined trim() errors.
 * Maintains semantic distinction between null and empty strings.
 */

/**
 * Safe trim that handles null/undefined values without throwing errors.
 * Returns empty string for null/undefined to prevent crashes.
 */
export function safeTrim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Safe trim that preserves null vs empty distinction.
 * Returns null for null/undefined input, empty string for empty input after trim.
 */
export function safeTrimPreserveNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
}

/**
 * Safe string conversion with trim that returns empty string for non-string values.
 */
export function safeStringTrim(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Check if a value is a non-empty string after trimming.
 */
export function hasNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Get first non-empty string from a list of values.
 */
export function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (hasNonEmptyString(value)) {
      return value!.trim();
    }
  }
  return '';
}

/**
 * Split string by lines and safely trim each line.
 */
export function splitAndTrimLines(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').map(line => safeTrim(line)).filter(line => line.length > 0);
}