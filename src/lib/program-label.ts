const qualifiers = /\s*\([^)]*(?:ingilizce|burs|ücret|ikinci öğretim|uzaktan öğretim|kktc|yurt dışı)[^)]*\)\s*/giu;
const anyParenthetical = /\s*\([^)]*\)\s*/gu;

export function plainProgramName(value: string | null | undefined) {
  return (value ?? "").replace(qualifiers, " ").replace(anyParenthetical, " ").replace(/\s+/g, " ").trim();
}

export function uniquePrograms<T extends { id: string; name: string }>(items: T[]) {
  const collator = new Intl.Collator("tr", { sensitivity: "base" });
  const unique = new Map<string, T & { displayName: string }>();
  for (const item of items) {
    const displayName = plainProgramName(item.name);
    const key = displayName.toLocaleLowerCase("tr-TR");
    if (!unique.has(key)) unique.set(key, { ...item, displayName });
  }
  return [...unique.values()].sort((a, b) => collator.compare(a.displayName, b.displayName));
}
