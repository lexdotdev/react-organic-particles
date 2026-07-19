import { resolveFieldProps } from "../src/presets/presets";
import type { PlaygroundState } from "./defaults";

// Round slider float noise (0.35000000000000003) for output.
function formatNumber(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

// Build a copy-pasteable snippet, omitting props the library
// resolves to the same value on its own (preset-aware defaults).
export function generateJsx(props: PlaygroundState): string {
  const base = resolveFieldProps({});
  const defaults = resolveFieldProps({ preset: props.preset });
  const lines: string[] = [];

  const num = (name: string, value: number, initial: number) => {
    if (value !== initial) lines.push(`${name}={${formatNumber(value)}}`);
  };
  const flag = (name: string, value: boolean) => {
    if (value) lines.push(name);
  };
  const text = (name: string, value: string, initial: string) => {
    if (value !== initial) lines.push(`${name}="${value}"`);
  };

  text("preset", props.preset, base.preset);
  if (props.preset === "svg") {
    // Escape quotes so full <svg> markup stays pasteable.
    lines.push(`svgPath="${props.svgPath.replace(/"/g, "&quot;")}"`);
  }
  if (props.colors.join() !== defaults.colors.join()) {
    const list = props.colors.map((color) => `"${color}"`).join(", ");
    lines.push(`colors={[${list}]}`);
  }
  num("density", props.density, defaults.density);
  num("speed", props.speed, defaults.speed);
  num("entropy", props.entropy, defaults.entropy);
  num("particleSize", props.particleSize, defaults.particleSize);
  num("scale", props.scale, defaults.scale);
  num("bloomIntensity", props.bloomIntensity, defaults.bloomIntensity);
  num("opacity", props.opacity, defaults.opacity);
  text("backgroundColor", props.backgroundColor, defaults.backgroundColor);
  flag("autoRotate", props.autoRotate);
  num("rotationSpeed", props.rotationSpeed, defaults.rotationSpeed);
  flag("interactive", props.interactive);
  num("interactionStrength", props.interactionStrength, defaults.interactionStrength);
  num("seed", props.seed, defaults.seed);
  flag("paused", props.paused);
  num("maxPixelRatio", props.maxPixelRatio, defaults.maxPixelRatio);
  text("quality", props.quality, defaults.quality);

  if (lines.length === 0) return "<OrganicParticleField />";
  return `<OrganicParticleField\n  ${lines.join("\n  ")}\n/>`;
}
