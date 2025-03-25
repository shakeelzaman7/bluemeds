export function capitalizeWords(str: string): string {
  if (str) {
    return str
    .toLowerCase()
    .replace(/(^|\s)([a-záéíóúüñ])/g, (_, space, letter) => space + letter.toUpperCase());
  }
}