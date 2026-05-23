export function contentType(name: string): string {
  const lower = name.toLowerCase()

  if (lower.endsWith('.png'))
    return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
    return 'image/jpeg'
  if (lower.endsWith('.webp'))
    return 'image/webp'

  return 'application/javascript; charset=utf-8'
}
