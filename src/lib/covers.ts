/** CSS linear-gradient from the product's stored hue pair. */
export function coverGradient(from: number, to: number): string {
  return `linear-gradient(135deg, hsl(${from} 72% 55%), hsl(${to} 72% 45%))`;
}

/** Lighter accent of the same hue pair for badges/washes. */
export function coverSoft(from: number, to: number): string {
  return `linear-gradient(135deg, hsl(${from} 72% 92%), hsl(${to} 72% 88%))`;
}
