import { Color } from "three";
import { describe, expect, it } from "vitest";
import { DEFAULT_COLORS, isValidCssColor, MAX_COLOR_SLOTS, parsePalette } from "./colors";

function slot(values: Float32Array, index: number): [number, number, number] {
  return [values[index * 3], values[index * 3 + 1], values[index * 3 + 2]];
}

function expectSlotMatches(values: Float32Array, index: number, css: string) {
  const expected = new Color(css);
  const [r, g, b] = slot(values, index);
  expect(r).toBeCloseTo(expected.r, 5);
  expect(g).toBeCloseTo(expected.g, 5);
  expect(b).toBeCloseTo(expected.b, 5);
}

describe("isValidCssColor", () => {
  it("accepts hex and rejects garbage", () => {
    expect(isValidCssColor("#7dd3fc")).toBe(true);
    expect(isValidCssColor("#fff")).toBe(true);
    expect(isValidCssColor("not-a-color")).toBe(false);
  });
});

describe("parsePalette", () => {
  it("fills 5 slots and reports the real count", () => {
    const { values, count } = parsePalette(["#ff0000", "#00ff00"]);
    expect(count).toBe(2);
    expect(values.length).toBe(MAX_COLOR_SLOTS * 3);
    expectSlotMatches(values, 0, "#ff0000");
    expectSlotMatches(values, 1, "#00ff00");
    // padding repeats the last real color
    expectSlotMatches(values, 4, "#00ff00");
  });

  it("falls back to the default palette entry for invalid strings", () => {
    const { values, count } = parsePalette(["#ff0000", "bogus", "#0000ff"]);
    expect(count).toBe(3);
    expectSlotMatches(values, 1, DEFAULT_COLORS[1]);
  });

  it("handles a single color as a flat palette", () => {
    const { values, count } = parsePalette(["#123456"]);
    expect(count).toBe(1);
    for (let i = 0; i < MAX_COLOR_SLOTS; i++) {
      expectSlotMatches(values, i, "#123456");
    }
  });

  it("clamps to 5 entries and defaults when empty", () => {
    expect(parsePalette(Array(7).fill("#111111")).count).toBe(5);
    const { values, count } = parsePalette([]);
    expect(count).toBe(DEFAULT_COLORS.length);
    expectSlotMatches(values, 0, DEFAULT_COLORS[0]);
  });
});
