import type { OrganicParticleFieldProps } from "@lexdotdev/react-organic-particles";

// Non-visual props are excluded from playground state.
type NonVisualProps = "fallback" | "className" | "style" | "onReady" | "aria-label";

export type PlaygroundState = Required<Omit<OrganicParticleFieldProps, NonVisualProps>>;

export type UpdateProp = <K extends keyof PlaygroundState>(
  key: K,
  value: PlaygroundState[K],
) => void;

// Sample path so the svg preset works out of the box.
export const HEART_PATH =
  "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z";

export const DEFAULT_PROPS: PlaygroundState = {
  preset: "nebula",
  svgPath: HEART_PATH,
  colors: ["#7dd3fc", "#2563eb", "#ffffff"],
  density: 0.96,
  speed: 1.2,
  entropy: 0.6,
  particleSize: 0.65,
  scale: 0.2,
  bloomIntensity: 0.05,
  opacity: 0.33,
  backgroundColor: "#000000",
  autoRotate: true,
  rotationSpeed: 1,
  interactive: false,
  interactionStrength: 1,
  seed: 231291,
  paused: false,
  maxPixelRatio: 2,
  quality: "auto",
};

export interface ExamplePreset {
  label: string;
  props: Partial<PlaygroundState>;
}

export const EXAMPLES: ExamplePreset[] = [
  {
    label: "Soft blob",
    props: {
      preset: "soft-blob",
      colors: ["#bae6fd", "#0284c7", "#ffffff"],
      density: 0.7,
      speed: 0.35,
      entropy: 0.25,
    },
  },
  {
    label: "Nebula",
    props: {
      preset: "nebula",
      colors: ["#020617", "#1d4ed8", "#22d3ee", "#ffffff"],
      density: 0.9,
      speed: 0.55,
      entropy: 0.75,
      bloomIntensity: 1.6,
      backgroundColor: "#020617",
    },
  },
  {
    label: "Chaos",
    props: {
      preset: "chaos",
      colors: ["#8b5cf6", "#ec4899", "#38bdf8"],
      density: 0.8,
      speed: 1.2,
      entropy: 1,
      interactive: true,
    },
  },
  {
    label: "SVG heart",
    props: {
      preset: "svg",
      svgPath: HEART_PATH,
      colors: ["#f472b6", "#ec4899", "#ffffff"],
      density: 0.6,
      speed: 0.4,
      entropy: 0.2,
    },
  },
];
