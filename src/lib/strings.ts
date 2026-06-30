export const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;
