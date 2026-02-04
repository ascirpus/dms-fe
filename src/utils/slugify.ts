/**
 * URL Slug utilities for human-friendly URLs
 * Format: "project-name-b37de66f" (slug + first 8 chars of UUID)
 */

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Generate a URL-friendly identifier from name and UUID
 * Example: "Acme Project" + "b37de66f-f450-..." → "acme-project-b37de66f"
 */
export function toUrlId(name: string, id: string): string {
  const slug = slugify(name);
  const shortId = id.substring(0, 8);
  return `${slug}-${shortId}`;
}

/**
 * Extract the short ID (last 8 characters) from a URL identifier
 * Example: "acme-project-b37de66f" → "b37de66f"
 */
export function extractShortId(urlId: string): string {
  return urlId.slice(-8);
}

/**
 * Find the full UUID from a URL identifier by looking up in a collection
 * Returns the full ID if found, null otherwise
 */
export function resolveFullId<T extends { id: string; name: string }>(
  urlId: string,
  items: T[]
): string | null {
  const shortId = extractShortId(urlId);

  const match = items.find(item =>
    item.id.startsWith(shortId)
  );

  return match?.id ?? null;
}

/**
 * Find an item from a URL identifier by looking up in a collection
 * Returns the item if found, null otherwise
 */
export function resolveItem<T extends { id: string; name: string }>(
  urlId: string,
  items: T[]
): T | null {
  const shortId = extractShortId(urlId);

  return items.find(item =>
    item.id.startsWith(shortId)
  ) ?? null;
}
