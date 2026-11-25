/** API 入参校验的小工具。接 Supabase 后可以换成 zod，先保持零依赖。 */

export function str(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export function strOr(value: unknown, fallback: string, max = 500): string {
  const result = str(value, max);
  return result === null ? fallback : result;
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== "string") return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

export function tags(value: unknown, max = 6): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[,，、]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, max);
}
