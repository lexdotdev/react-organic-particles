import { describe, expect, it } from "vitest";
import { generateParticles } from "./particleGenerators";
import { createSeededRandom } from "./seededRandom";
import { sampleSvgPositions } from "./svgParticles";

const CIRCLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="40"/></svg>';
const PATH_D = "M 10 10 L 90 10 L 90 90 Z";
const TWO_LINES_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">' +
  '<path d="M 0 10 L 100 10"/><path d="M 0 210 L 100 210"/></svg>';

describe("sampleSvgPositions", () => {
  it("accepts full <svg> markup and bare path data", () => {
    const out = new Float32Array(300);
    expect(sampleSvgPositions(out, CIRCLE_SVG, createSeededRandom(1))).toBe(true);
    expect(sampleSvgPositions(out, PATH_D, createSeededRandom(1))).toBe(true);
  });

  it("is deterministic for the same input and seed", () => {
    const a = generateParticles("svg", 400, 7, CIRCLE_SVG);
    const b = generateParticles("svg", 400, 7, CIRCLE_SVG);
    const c = generateParticles("svg", 400, 8, CIRCLE_SVG);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.positions)).not.toEqual(Array.from(c.positions));
  });

  it("returns typed arrays of the requested length", () => {
    const { positions, randoms } = generateParticles("svg", 500, 1, CIRCLE_SVG);
    expect(positions).toBeInstanceOf(Float32Array);
    expect(randoms).toBeInstanceOf(Float32Array);
    expect(positions.length).toBe(1500);
    expect(randoms.length).toBe(1500);
  });

  it("stays near-planar with organic z thickness", () => {
    const { positions } = generateParticles("svg", 2000, 1, CIRCLE_SVG);
    for (let i = 0; i < 2000; i++) {
      expect(Math.abs(positions[i * 3 + 2])).toBeLessThanOrEqual(0.03);
    }
  });

  it("normalizes the outline to the standard formation size", () => {
    const { positions } = generateParticles("svg", 2000, 1, CIRCLE_SVG);
    let maxCoord = 0;
    for (let i = 0; i < positions.length; i++) {
      const value = Math.abs(positions[i]);
      expect(Number.isFinite(value)).toBe(true);
      if (value > maxCoord) maxCoord = value;
    }
    expect(maxCoord).toBeGreaterThan(0.95);
    expect(maxCoord).toBeLessThan(1.05);
  });

  it("samples from every subpath", () => {
    const { positions } = generateParticles("svg", 3000, 1, TWO_LINES_SVG);
    let top = 0;
    let bottom = 0;
    for (let i = 0; i < 3000; i++) {
      const y = positions[i * 3 + 1];
      if (y > 0.5) top++;
      if (y < -0.5) bottom++;
    }
    expect(top).toBeGreaterThan(900);
    expect(bottom).toBeGreaterThan(900);
  });

  it("flips SVG y-down coordinates into three's y-up", () => {
    // Most of the outline length sits at svg y=0, i.e. positive y here.
    const lopsided =
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 100 0 L 100 10"/></svg>';
    const { positions } = generateParticles("svg", 2000, 1, lopsided);
    let sum = 0;
    for (let i = 0; i < 2000; i++) {
      sum += positions[i * 3 + 1];
    }
    expect(sum / 2000).toBeGreaterThan(0.05);
  });

  it("falls back on empty or invalid input without throwing", () => {
    const out = new Float32Array(30);
    expect(sampleSvgPositions(out, undefined, createSeededRandom(1))).toBe(false);
    expect(sampleSvgPositions(out, "", createSeededRandom(1))).toBe(false);
    expect(sampleSvgPositions(out, "<svg><path d='M foo bar'/></svg>", createSeededRandom(1))).toBe(
      false,
    );
    const { positions } = generateParticles("svg", 100, 1, "not a path at all");
    expect(positions.length).toBe(300);
    for (const value of positions) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});
