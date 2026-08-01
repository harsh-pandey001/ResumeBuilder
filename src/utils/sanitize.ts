/**
 * Strip HTML tags from contenteditable input. A regex is a stopgap (P0) — a
 * proper sanitizer (DOMPurify) is planned for P2 once rich text is introduced.
 */
export function stripTags(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, '');
}
