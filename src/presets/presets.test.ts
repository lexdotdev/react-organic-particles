// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DEFAULT_COLORS } from "../utils/colors";
import { getPreset, PRESETS, resolveFieldProps, resolveShapeParams } from "./presets";

describe("getPreset", () => {
  it("resolves every preset name and unique shapes 0..5", () => {
    const shapes = PRESETS.map((preset) => {
      expect(getPreset(preset.name).name).toBe(preset.name);
      return preset.shape;
    });
    expect(new Set(shapes)).toEqual(new Set([0, 1, 2, 3, 4, 5]));
  });

  it("maps the svg preset to the svg generator at shape 5", () => {
    const svg = getPreset("svg");
    expect(svg.generator).toBe("svg");
    expect(svg.shape).toBe(5);
  });
});

describe("resolveFieldProps", () => {
  it("applies documented defaults", () => {
    const resolved = resolveFieldProps({});
    expect(resolved).toMatchObject({
      density: 0.5,
      speed: 0.8, // soft-blob preset override
      entropy: 0.3, // soft-blob preset override
      preset: "soft-blob",
      particleSize: 1.1, // soft-blob preset override
      scale: 1,
      bloomIntensity: 1,
      opacity: 1,
      backgroundColor: "transparent",
      autoRotate: false,
      rotationSpeed: 1,
      interactive: false,
      interactionStrength: 1,
      seed: 1,
      paused: false,
      maxPixelRatio: 2,
      quality: "auto",
    });
    expect(resolved.colors).toEqual([...DEFAULT_COLORS]);
  });

  it("applies preset overrides", () => {
    const resolved = resolveFieldProps({ preset: "nebula" });
    expect(resolved.entropy).toBe(0.6);
    expect(resolved.speed).toBe(0.6);
    expect(resolved.bloomIntensity).toBe(1.4);
  });

  it("explicit props win over preset values", () => {
    const resolved = resolveFieldProps({ preset: "nebula", entropy: 0.2, speed: 2 });
    expect(resolved.entropy).toBe(0.2);
    expect(resolved.speed).toBe(2);
  });

  it("clamps numeric props to documented ranges", () => {
    const resolved = resolveFieldProps({
      density: 4,
      speed: -1,
      entropy: 2,
      particleSize: 100,
      scale: 0,
      bloomIntensity: 9,
      opacity: -0.5,
      rotationSpeed: 42,
      interactionStrength: 11,
      maxPixelRatio: 0.2,
    });
    expect(resolved).toMatchObject({
      density: 1,
      speed: 0,
      entropy: 1,
      particleSize: 8,
      scale: 0.1,
      bloomIntensity: 5,
      opacity: 0,
      rotationSpeed: 10,
      interactionStrength: 5,
      maxPixelRatio: 1,
    });
  });

  it("normalizes colors to 1..5 entries", () => {
    expect(resolveFieldProps({ colors: [] }).colors).toEqual([...DEFAULT_COLORS]);
    expect(resolveFieldProps({ colors: Array(9).fill("#111111") }).colors).toHaveLength(5);
  });

  it("applies svg preset overrides and keeps explicit props winning", () => {
    const resolved = resolveFieldProps({ preset: "svg" });
    expect(resolved.speed).toBe(0.5);
    expect(resolved.entropy).toBe(0.2);
    expect(resolveFieldProps({ preset: "svg", speed: 2 }).speed).toBe(2);
  });

  it("passes svgPath through untouched; presets never set it", () => {
    const d = "M 0 0 L 10 10";
    expect(resolveFieldProps({ svgPath: d }).svgPath).toBe(d);
    expect(resolveFieldProps({ preset: "svg" }).svgPath).toBeUndefined();
  });
});

describe("resolveShapeParams", () => {
  it("lerps entropy ranges with preset scales", () => {
    const preset = getPreset("soft-blob");
    const calm = resolveShapeParams(preset, 0);
    const wild = resolveShapeParams(preset, 1);
    expect(calm.noiseFreq).toBeCloseTo(0.6 * preset.freqScale, 5);
    expect(wild.noiseFreq).toBeCloseTo(2.2 * preset.freqScale, 5);
    expect(calm.curlStrength).toBe(0);
    expect(wild.curlStrength).toBeCloseTo(1.5 * preset.curlScale, 5);
    expect(calm.octaves).toBe(2);
    expect(wild.octaves).toBe(5);
  });
});
