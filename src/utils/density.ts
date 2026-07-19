import type { OrganicParticleQuality } from "../types";
import { clamp } from "./clamp";

export type DeviceClass = "mobile" | "desktop";

export interface DensityRange {
  readonly min: number;
  readonly max: number;
}

export const DESKTOP_RANGE: DensityRange = { min: 8000, max: 120000 };
export const MOBILE_RANGE: DensityRange = { min: 4000, max: 35000 };

// Quality rule: low = mobile range with max halved, medium = mobile
// range, high = desktop range, auto = detected device class.
export function resolveDensityRange(
  quality: OrganicParticleQuality,
  detected: DeviceClass,
): DensityRange {
  switch (quality) {
    case "high":
      return DESKTOP_RANGE;
    case "medium":
      return MOBILE_RANGE;
    case "low":
      return { min: MOBILE_RANGE.min, max: Math.round(MOBILE_RANGE.max * 0.5) };
    case "auto":
      return detected === "desktop" ? DESKTOP_RANGE : MOBILE_RANGE;
  }
}

export function particleCount(density: number, range: DensityRange): number {
  const t = clamp(density, 0, 1);
  return Math.round(range.min + (range.max - range.min) * t);
}
