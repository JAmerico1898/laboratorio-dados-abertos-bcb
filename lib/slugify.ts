/**
 * Slugify a modality name to match the Python prefetch script's naming convention.
 * This MUST produce identical output to scripts/prefetch_data.py:slugify()
 *
 * Python source:
 *   s = name.lower()
 *   for old, new in [("é","e"),("á","a"),("ã","a"),("â","a"),("í","i"),
 *                     ("ó","o"),("ú","u"),("ç","c"),("ê","e"),("ô","o")]:
 *       s = s.replace(old, new)
 *   s = re.sub(r"[^a-z0-9]+", "_", s)
 *   return s.strip("_")[:80]
 */
export function slugify(name: string): string {
  let s = name.toLowerCase();

  const replacements: [string, string][] = [
    ["é", "e"],
    ["á", "a"],
    ["ã", "a"],
    ["â", "a"],
    ["í", "i"],
    ["ó", "o"],
    ["ú", "u"],
    ["ç", "c"],
    ["ê", "e"],
    ["ô", "o"],
  ];

  for (const [old, replacement] of replacements) {
    s = s.replaceAll(old, replacement);
  }

  // Replace non-alphanumeric sequences with underscore
  s = s.replace(/[^a-z0-9]+/g, "_");

  // Strip leading/trailing underscores and limit to 80 chars
  s = s.replace(/^_+|_+$/g, "");
  return s.slice(0, 80);
}
