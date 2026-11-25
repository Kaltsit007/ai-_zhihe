export function cn(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}
