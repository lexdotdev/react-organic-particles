import type { OrganicParticleQuality } from "@lexdotdev/react-organic-particles";
import { useId } from "react";
import { PRESETS } from "../src/presets/presets";
import { BackgroundField } from "./components/BackgroundField";
import { ColorListField } from "./components/ColorListField";
import { CheckboxField, Field, SelectField, SliderField } from "./components/fields";
import type { PlaygroundState, UpdateProp } from "./defaults";

const PRESET_NAMES = PRESETS.map((preset) => preset.name);
const QUALITY_OPTIONS: readonly OrganicParticleQuality[] = ["auto", "low", "medium", "high"];

interface ControlPanelProps {
  state: PlaygroundState;
  update: UpdateProp;
  bgHex: string;
  onBgHexChange: (hex: string) => void;
}

interface SeedFieldProps {
  value: number;
  onChange: (seed: number) => void;
}

function SeedField({ value, onChange }: SeedFieldProps) {
  const id = useId();
  return (
    <Field id={id} label="Seed">
      <div className="seed-row">
        <input
          id={id}
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(event) => onChange(Math.max(0, Math.floor(Number(event.target.value) || 0)))}
        />
        <button type="button" onClick={() => onChange(Math.floor(Math.random() * 1_000_000))}>
          Randomize
        </button>
      </div>
    </Field>
  );
}

interface SvgPathFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function SvgPathField({ value, onChange }: SvgPathFieldProps) {
  const id = useId();
  return (
    <Field id={id} label="SVG path">
      <textarea
        id={id}
        rows={4}
        spellCheck={false}
        placeholder="Path data (d attribute) or full <svg> markup"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function ControlPanel({ state, update, bgHex, onBgHexChange }: ControlPanelProps) {
  return (
    <>
      <section className="panel">
        <h2>Preset</h2>
        <SelectField
          label="Preset"
          value={state.preset}
          options={PRESET_NAMES}
          onChange={(value) => update("preset", value)}
        />
        {state.preset === "svg" && (
          <SvgPathField value={state.svgPath} onChange={(value) => update("svgPath", value)} />
        )}
        <p className="hint">Explicit props override preset values.</p>
      </section>

      <section className="panel">
        <h2>Field</h2>
        <ColorListField colors={state.colors} onChange={(colors) => update("colors", colors)} />
        <SliderField
          label="Density"
          value={state.density}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => update("density", value)}
        />
        <SliderField
          label="Speed"
          value={state.speed}
          min={0}
          max={3}
          step={0.05}
          onChange={(value) => update("speed", value)}
        />
        <SliderField
          label="Entropy"
          value={state.entropy}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => update("entropy", value)}
        />
      </section>

      <section className="panel">
        <h2>Appearance</h2>
        <SliderField
          label="Particle size"
          value={state.particleSize}
          min={0.05}
          max={8}
          step={0.05}
          onChange={(value) => update("particleSize", value)}
        />
        <SliderField
          label="Scale"
          value={state.scale}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) => update("scale", value)}
        />
        <SliderField
          label="Bloom intensity"
          value={state.bloomIntensity}
          min={0}
          max={5}
          step={0.05}
          onChange={(value) => update("bloomIntensity", value)}
        />
        <SliderField
          label="Opacity"
          value={state.opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => update("opacity", value)}
        />
        <BackgroundField
          value={state.backgroundColor}
          hex={bgHex}
          onHexChange={onBgHexChange}
          onChange={(value) => update("backgroundColor", value)}
        />
      </section>

      <section className="panel">
        <h2>Motion</h2>
        <CheckboxField
          label="Auto-rotate"
          checked={state.autoRotate}
          onChange={(checked) => update("autoRotate", checked)}
        />
        <SliderField
          label="Rotation speed"
          value={state.rotationSpeed}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => update("rotationSpeed", value)}
        />
        <CheckboxField
          label="Interactive"
          checked={state.interactive}
          onChange={(checked) => update("interactive", checked)}
        />
        <SliderField
          label="Interaction strength"
          value={state.interactionStrength}
          min={0}
          max={5}
          step={0.1}
          onChange={(value) => update("interactionStrength", value)}
        />
        <CheckboxField
          label="Paused"
          checked={state.paused}
          onChange={(checked) => update("paused", checked)}
        />
      </section>

      <section className="panel">
        <h2>Rendering</h2>
        <SelectField
          label="Quality"
          value={state.quality}
          options={QUALITY_OPTIONS}
          onChange={(value) => update("quality", value)}
        />
        <SliderField
          label="Max pixel ratio"
          value={state.maxPixelRatio}
          min={1}
          max={3}
          step={0.5}
          onChange={(value) => update("maxPixelRatio", value)}
        />
        <SeedField value={state.seed} onChange={(seed) => update("seed", seed)} />
      </section>
    </>
  );
}
