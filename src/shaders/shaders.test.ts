// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NOISE_GLSL } from "./noise.glsl";
import { particleFragmentShader } from "./particle.frag";
import { particleVertexShader } from "./particle.vert";

const VERTEX_UNIFORMS = [
  "uTime",
  "uSpeed",
  "uEntropy",
  "uParticleSize",
  "uScale",
  "uPointer",
  "uInteractionStrength",
  "uColorCount",
  "uColors",
  "uPixelRatio",
];

function uniformDeclaration(name: string): RegExp {
  return new RegExp(`uniform\\s+\\w+\\s+${name}(\\s*\\[\\s*\\d+\\s*\\])?\\s*;`);
}

function expectBalanced(source: string) {
  for (const [open, close] of [
    ["{", "}"],
    ["(", ")"],
  ]) {
    const opens = source.split(open).length - 1;
    const closes = source.split(close).length - 1;
    expect(opens).toBe(closes);
  }
}

describe("noise glsl", () => {
  it("exposes snoise and fbm", () => {
    expect(NOISE_GLSL).toContain("float snoise(vec3 v)");
    expect(NOISE_GLSL).toContain("float fbm(vec3 p, int octaves)");
  });
});

describe("particle vertex shader", () => {
  it("declares every required uniform", () => {
    for (const name of VERTEX_UNIFORMS) {
      expect(particleVertexShader).toMatch(uniformDeclaration(name));
    }
  });

  it("writes point size and position", () => {
    expect(particleVertexShader).toContain("gl_PointSize");
    expect(particleVertexShader).toContain("gl_Position");
  });

  it("branches on every shape weight 0..5", () => {
    for (let shape = 0; shape <= 5; shape++) {
      expect(particleVertexShader).toContain(`shapeWeight(${shape}.0)`);
    }
  });

  it("has balanced braces and parens", () => {
    expectBalanced(particleVertexShader);
  });
});

describe("particle fragment shader", () => {
  it("builds a soft sprite from gl_PointCoord with discard", () => {
    expect(particleFragmentShader).toContain("gl_PointCoord");
    expect(particleFragmentShader).toContain("discard");
    expect(particleFragmentShader).toMatch(uniformDeclaration("uOpacity"));
  });

  it("has balanced braces and parens", () => {
    expectBalanced(particleFragmentShader);
  });
});
