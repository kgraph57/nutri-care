/**
 * Normalize Japanese text for fuzzy matching.
 * - Lowercase
 * - Remove all whitespace (including full-width)
 * - Remove dashes / prolonged sound marks
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u3000]/g, "")
    .replace(/[ー−-]/g, "");
}
