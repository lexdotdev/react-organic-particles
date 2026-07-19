import type { SeededRandom } from "./seededRandom";
import { createSeededRandom } from "./seededRandom";
import { sampleSvgPositions } from "./svgParticles";

export type GeneratorShape = "sphere" | "volumetric" | "ribbon" | "vortex" | "svg";

export interface GeneratedParticles {
  positions: Float32Array;
  randoms: Float32Array;
}

const TAU = Math.PI * 2;

// Fibonacci lattice: equal-area bands, no pole clustering.
// Seeded phase rotates the lattice without disturbing uniformity.
function fillSphere(out: Float32Array, rng: SeededRandom): void {
  const n = out.length / 3;
  const radius = 1.5;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const phase = rng() * TAU;
  for (let i = 0; i < n; i++) {
    const z = 1 - (2 * (i + 0.5)) / n;
    const band = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = goldenAngle * i + phase;
    out[i * 3] = radius * band * Math.cos(theta);
    out[i * 3 + 1] = radius * band * Math.sin(theta);
    out[i * 3 + 2] = radius * z;
  }
}

// Box-Muller radial gaussian on a uniform sphere direction.
function fillVolumetric(out: Float32Array, rng: SeededRandom): void {
  const n = out.length / 3;
  for (let i = 0; i < n; i++) {
    const u = Math.max(rng(), 1e-6);
    const radius = Math.min(2.4, Math.sqrt(-2 * Math.log(u)) * 0.55);
    const z = rng() * 2 - 1;
    const phi = rng() * TAU;
    const band = Math.sqrt(Math.max(0, 1 - z * z));
    out[i * 3] = radius * band * Math.cos(phi);
    out[i * 3 + 1] = radius * band * Math.sin(phi);
    out[i * 3 + 2] = radius * z;
  }
}

// Horizontal sheets stacked in bands, gently curved along x.
function fillRibbon(out: Float32Array, rng: SeededRandom): void {
  const n = out.length / 3;
  const bands = [-0.55, 0, 0.55];
  for (let i = 0; i < n; i++) {
    const x = (rng() * 2 - 1) * 2.2;
    const band = bands[Math.min(2, Math.floor(rng() * 3))];
    out[i * 3] = x;
    out[i * 3 + 1] = band + (rng() - 0.5) * 0.3;
    out[i * 3 + 2] = Math.sin(x * 1.6 + band * 4) * 0.18 + (rng() - 0.5) * 0.22;
  }
}

// Logarithmic spiral arm on a disc that thickens outward.
function fillVortex(out: Float32Array, rng: SeededRandom): void {
  const n = out.length / 3;
  for (let i = 0; i < n; i++) {
    const theta = rng() * Math.PI * 6;
    const radius = 0.2 * Math.exp(0.12 * theta);
    const jitter = 0.06 * radius;
    out[i * 3] = radius * Math.cos(theta) + (rng() - 0.5) * jitter;
    out[i * 3 + 1] = (rng() - 0.5) * 0.12 * (0.4 + radius * 0.4);
    out[i * 3 + 2] = radius * Math.sin(theta) + (rng() - 0.5) * jitter;
  }
}

// aRandom: x = phase offset, y = size jitter, z = color-mix jitter.
export function generateParticles(
  shape: GeneratorShape,
  count: number,
  seed: number,
  svgPath?: string,
): GeneratedParticles {
  const rng = createSeededRandom(seed);
  const positions = new Float32Array(count * 3);
  switch (shape) {
    case "sphere":
      fillSphere(positions, rng);
      break;
    case "volumetric":
      fillVolumetric(positions, rng);
      break;
    case "ribbon":
      fillRibbon(positions, rng);
      break;
    case "vortex":
      fillVortex(positions, rng);
      break;
    case "svg":
      // Unusable input keeps the cloud alive via volumetric fallback.
      if (!sampleSvgPositions(positions, svgPath, rng)) {
        fillVolumetric(positions, rng);
      }
      break;
  }
  const randoms = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    randoms[i * 3] = rng() * TAU;
    randoms[i * 3 + 1] = 0.5 + rng();
    randoms[i * 3 + 2] = rng();
  }
  return { positions, randoms };
}
