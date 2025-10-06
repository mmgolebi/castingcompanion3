export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(baseName: string, existingSlugs: string[]): string {
  let slug = generateSlug(baseName);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }
  
  return slug;
}
