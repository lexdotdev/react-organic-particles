import type * as React from "react";

export type OrganicParticlePreset = "soft-blob" | "nebula" | "vortex" | "wave" | "chaos" | "svg";

export type OrganicParticleQuality = "auto" | "low" | "medium" | "high";

export interface OrganicParticleFieldHandle {
  pause(): void;
  resume(): void;
  reset(): void;
  setTime(time: number): void;
}

export interface OrganicParticleFieldProps {
  colors?: string[];
  density?: number;
  speed?: number;
  entropy?: number;
  preset?: OrganicParticlePreset;
  /**
   * SVG path data ("d" attribute) or full "<svg>" markup.
   * Sampled along the outline when preset is "svg".
   * Missing or invalid input falls back to a blob formation.
   */
  svgPath?: string;
  particleSize?: number;
  scale?: number;
  bloomIntensity?: number;
  opacity?: number;
  backgroundColor?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  interactive?: boolean;
  interactionStrength?: number;
  seed?: number;
  paused?: boolean;
  maxPixelRatio?: number;
  quality?: OrganicParticleQuality;
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
  "aria-label"?: string;
}
