const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "kayit";
}

export function catalogSegment(name: string, id: string) { return `${slugify(name)}--${id}`; }

export function catalogIdFromSegment(segment: string) {
  const separator = segment.lastIndexOf("--");
  if (separator < 1) return null;
  const id = segment.slice(separator + 2);
  return UUID_PATTERN.test(id) ? id.toLowerCase() : null;
}

export function questionSegment(title: string, id: string) {
  return `${slugify(title)}-${id}`;
}

export function questionIdFromSegment(segment: string) {
  const id = segment.slice(-36);
  if (segment.at(-37) !== "-" || !UUID_PATTERN.test(id)) return null;
  return id.toLowerCase();
}
