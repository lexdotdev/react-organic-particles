import type {
  OrganicParticleFieldProps,
  OrganicParticlePreset,
  OrganicParticleQuality,
} from "../types";
import { clamp, lerp } from "../utils/clamp";
import { normalizeColorList } from "../utils/colors";
import type { GeneratorShape } from "../utils/particleGenerators";

// Props a preset may override; explicit props always win.
type PresetPropOverrides = Partial<
  Pick<
    OrganicParticleFieldProps,
    | "entropy"
    | "speed"
    | "particleSize"
    | "bloomIntensity"
    | "rotationSpeed"
    | "interactionStrength"
  >
>;

export interface PresetDefinition {
  readonly name: OrganicParticlePreset;
  readonly shape: number;
  readonly generator: GeneratorShape;
  readonly props: PresetPropOverrides;
  readonly freqScale: number;
  readonly ampScale: number;
  readonly curlScale: number;
}

export const PRESETS: readonly PresetDefinition[] = [
  {
    name: "soft-blob",
    shape: 0,
    generator: "sphere",
    props: { entropy: 0.3, speed: 0.8, particleSize: 1.1, bloomIntensity: 1 },
    freqScale: 0.8,
    ampScale: 0.7,
    curlScale: 0.3,
  },
  {
    name: "nebula",
    shape: 1,
    generator: "volumetric",
    props: { entropy: 0.6, speed: 0.6, particleSize: 0.9, bloomIntensity: 1.4 },
    freqScale: 0.7,
    ampScale: 1.25,
    curlScale: 0.4,
  },
  {
    name: "vortex",
    shape: 2,
    generator: "vortex",
    props: {
      entropy: 0.45,
      speed: 1.2,
      particleSize: 0.9,
      bloomIntensity: 1.1,
      rotationSpeed: 1.5,
    },
    freqScale: 1,
    ampScale: 0.8,
    curlScale: 1.4,
  },
  {
    name: "wave",
    shape: 3,
    generator: "ribbon",
    props: { entropy: 0.4, speed: 1, particleSize: 0.8, bloomIntensity: 0.9 },
    freqScale: 1.1,
    ampScale: 1,
    curlScale: 0.2,
  },
  {
    name: "chaos",
    shape: 4,
    generator: "volumetric",
    props: { entropy: 0.85, speed: 1.3, particleSize: 0.75, bloomIntensity: 1.2 },
    freqScale: 1.6,
    ampScale: 1.2,
    curlScale: 1,
  },
  {
    name: "svg",
    shape: 5,
    generator: "svg",
    props: { entropy: 0.2, speed: 0.5, particleSize: 1, bloomIntensity: 1 },
    // Low amplitude/frequency keep the sampled silhouette readable.
    freqScale: 0.6,
    ampScale: 0.3,
    curlScale: 0.15,
  },
];

export function getPreset(name: OrganicParticlePreset): PresetDefinition {
  return PRESETS.find((preset) => preset.name === name) ?? PRESETS[0];
}

export interface ResolvedFieldProps {
  colors: string[];
  density: number;
  speed: number;
  entropy: number;
  preset: OrganicParticlePreset;
  particleSize: number;
  scale: number;
  bloomIntensity: number;
  opacity: number;
  backgroundColor: string;
  autoRotate: boolean;
  rotationSpeed: number;
  interactive: boolean;
  interactionStrength: number;
  seed: number;
  paused: boolean;
  maxPixelRatio: number;
  quality: OrganicParticleQuality;
  svgPath?: string;
}

export function resolveFieldProps(props: OrganicParticleFieldProps): ResolvedFieldProps {
  const presetName = props.preset ?? "soft-blob";
  const preset = getPreset(presetName);
  const pick = (key: keyof PresetPropOverrides, fallback: number): number =>
    props[key] ?? preset.props[key] ?? fallback;
  return {
    colors: normalizeColorList(props.colors),
    density: clamp(props.density ?? 0.5, 0, 1),
    speed: clamp(pick("speed", 1), 0, 3),
    entropy: clamp(pick("entropy", 0.5), 0, 1),
    preset: presetName,
    particleSize: clamp(pick("particleSize", 1), 0.05, 8),
    scale: clamp(props.scale ?? 1, 0.1, 10),
    bloomIntensity: clamp(pick("bloomIntensity", 1), 0, 5),
    opacity: clamp(props.opacity ?? 1, 0, 1),
    backgroundColor: props.backgroundColor ?? "transparent",
    autoRotate: props.autoRotate ?? false,
    rotationSpeed: clamp(pick("rotationSpeed", 1), 0, 10),
    interactive: props.interactive ?? false,
    interactionStrength: clamp(pick("interactionStrength", 1), 0, 5),
    seed: props.seed ?? 1,
    paused: props.paused ?? false,
    maxPixelRatio: clamp(props.maxPixelRatio ?? 2, 1, 3),
    quality: props.quality ?? "auto",
    svgPath: props.svgPath, // explicit prop only; presets never set it
  };
}

export interface ShapeParams {
  shape: number;
  noiseFreq: number;
  noiseAmp: number;
  curlStrength: number;
  octaves: number;
}

// Entropy lerps: calm drift at 0, turbulent folding at 1.
export function resolveShapeParams(preset: PresetDefinition, entropy: number): ShapeParams {
  const e = clamp(entropy, 0, 1);
  return {
    shape: preset.shape,
    noiseFreq: lerp(0.6, 2.2, e) * preset.freqScale,
    noiseAmp: lerp(0.15, 0.9, e) * preset.ampScale,
    curlStrength: lerp(0, 1.5, e) * preset.curlScale,
    octaves: Math.round(lerp(2, 5, e)),
  };
}
