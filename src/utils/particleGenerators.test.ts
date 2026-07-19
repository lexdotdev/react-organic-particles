// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateParticles, type GeneratorShape } from "./particleGenerators";
import { createSeededRandom } from "./seededRandom";

const SHAPES: GeneratorShape[] = ["sphere", "volumetric", "ribbon", "vortex"];

describe("createSeededRandom", () => {
  it("is deterministic and stays in [0, 1)", () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("generateParticles", () => {
  it("returns typed arrays of the right length", () => {
    for (const shape of SHAPES) {
      const { positions, randoms } = generateParticles(shape, 500, 1);
      expect(positions).toBeInstanceOf(Float32Array);
      expect(randoms).toBeInstanceOf(Float32Array);
      expect(positions.length).toBe(1500);
      expect(randoms.length).toBe(1500);
    }
  });

  it("same seed produces identical arrays, different seed does not", () => {
    for (const shape of SHAPES) {
      const a = generateParticles(shape, 300, 7);
      const b = generateParticles(shape, 300, 7);
      const c = generateParticles(shape, 300, 8);
      expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
      expect(Array.from(a.randoms)).toEqual(Array.from(b.randoms));
      expect(Array.from(a.positions)).not.toEqual(Array.from(c.positions));
    }
  });

  it("sphere has no severe pole clustering", () => {
    const n = 6000;
    const { positions } = generateParticles("sphere", n, 1);
    const bins = 12;
    const histogram = new Array(bins).fill(0);
    for (let i = 0; i < n; i++) {
      const z = positions[i * 3 + 2];
      const bin = Math.min(bins - 1, Math.floor(((z / 1.5 + 1) / 2) * bins));
      histogram[bin]++;
    }
    for (const count of histogram) {
      expect(count).toBeGreaterThan((n / bins) * 0.85);
      expect(count).toBeLessThan((n / bins) * 1.15);
    }
  });

  it("size jitter stays in the documented 0.5..1.5 band", () => {
    const { randoms } = generateParticles("volumetric", 1000, 3);
    for (let i = 0; i < 1000; i++) {
      expect(randoms[i * 3 + 1]).toBeGreaterThanOrEqual(0.5);
      expect(randoms[i * 3 + 1]).toBeLessThan(1.5);
    }
  });
});
