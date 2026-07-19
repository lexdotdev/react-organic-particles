import { Color } from "three";

export const MAX_COLOR_SLOTS = 5;
export const DEFAULT_COLORS: readonly string[] = ["#7dd3fc", "#2563eb", "#ffffff"];

export interface ParsedPalette {
  values: Float32Array;
  count: number;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNC_COLOR = /^(?:rgb|rgba|hsl|hsla)\([^)]+\)$/i;

export function isValidCssColor(value: string): boolean {
  const trimmed = value.trim();
  if (HEX_COLOR.test(trimmed)) return true;
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", trimmed);
  }
  // Node has no CSS global; accept functional notations only.
  return FUNC_COLOR.test(trimmed);
}

export function normalizeColorList(input: readonly string[] | undefined): string[] {
  if (!input || input.length === 0) return [...DEFAULT_COLORS];
  return input.slice(0, MAX_COLOR_SLOTS);
}

// Invalid entries fall back to the default palette entry at that slot.
export function parsePalette(colors: readonly string[]): ParsedPalette {
  const list = normalizeColorList(colors);
  const count = list.length;
  const values = new Float32Array(MAX_COLOR_SLOTS * 3);
  const parsed = new Color();
  for (let slot = 0; slot < MAX_COLOR_SLOTS; slot++) {
    const source = slot < count ? list[slot] : list[count - 1];
    const usable = isValidCssColor(source) ? source : DEFAULT_COLORS[slot % DEFAULT_COLORS.length];
    parsed.set(usable);
    values[slot * 3] = parsed.r;
    values[slot * 3 + 1] = parsed.g;
    values[slot * 3 + 2] = parsed.b;
  }
  return { values, count };
}
