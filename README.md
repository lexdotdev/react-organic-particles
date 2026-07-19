# @lexdotdev/react-organic-particles

GPU-animated organic 3D particle fields for React, built on Three.js and React Three Fiber.

## Overview

`OrganicParticleField` renders a cloud of particles that morphs through organic formations — blobs, nebulae, vortices, waves, turbulent chaos. All motion is computed in shaders on the GPU; the CPU never touches individual particles.

- Shader-based animation, no per-particle CPU updates
- Five presets with per-prop overrides
- Deterministic, seeded particle generation
- Optional pointer-reactive deformation
- Postprocessing bloom, fully disableable
- Automatic quality and pixel-ratio scaling
- Pauses when the tab is hidden or the field scrolls out of view
- Static frame under `prefers-reduced-motion`
- SSR-safe, with a `fallback` slot for missing WebGL
- Fully typed, including an imperative handle

## Installation

```bash
npm install @lexdotdev/react-organic-particles
# or
yarn add @lexdotdev/react-organic-particles
# or
pnpm add @lexdotdev/react-organic-particles
```

`react`, `react-dom`, `three` and `@react-three/fiber` are peer dependencies and must be installed in the host app:

```bash
npm install three @react-three/fiber
```

Why some packages are peers: `react`, `react-dom`, `three` and `@react-three/fiber` must resolve to a single copy in the host app — duplicated copies break hooks, context and rendering. `@react-three/drei` and `@react-three/postprocessing` are direct dependencies instead: they are internal implementation details that must version-lock with the library.

### Renaming the package

The scoped name is a placeholder that lives only in the `name` field of `package.json`. Change it there before publishing; no source file references it.

## Basic usage

The component fills its parent, so the parent needs a size:

```tsx
import { OrganicParticleField } from "@lexdotdev/react-organic-particles";

export function HeroBackground() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <OrganicParticleField />
    </div>
  );
}
```

## Parent container sizing

`OrganicParticleField` renders a wrapper with `width: 100%`, `height: 100%`, `position: relative` and `overflow: hidden`. It never sets its own dimensions — the parent must define them, otherwise the field collapses to zero height.

Any sizing strategy works: fixed pixels, viewport units, or flex/grid tracks.

```tsx
// Viewport-sized hero
<div style={{ position: "relative", height: "100vh" }}>
  <OrganicParticleField preset="nebula" />
</div>

// Fixed-height card
<div style={{ position: "relative", height: 320 }}>
  <OrganicParticleField density={0.3} />
</div>
```

If the canvas stays blank, a missing parent height is the first thing to check.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `colors` | `string[]` | `["#7dd3fc", "#2563eb", "#ffffff"]` | 1–5 CSS colors; smooth gradient across the formation |
| `density` | `number` | `0.5` | `[0, 1]` particle count: ~8k–120k desktop, ~4k–35k mobile |
| `speed` | `number` | `1` | `[0, 3]` temporal rate only; shape unchanged |
| `entropy` | `number` | `0.5` | `[0, 1]` turbulence / curl / disorder master control |
| `preset` | `OrganicParticlePreset` | `"soft-blob"` | Base look; explicit props override preset values |
| `svgPath` | `string` | `undefined` | SVG path data (`"d"` attribute) or full `"<svg>"` markup; sampled along the outline when `preset` is `"svg"`. Missing or invalid input falls back to a blob formation |
| `particleSize` | `number` | `1` | `[0.05, 8]` point size multiplier |
| `scale` | `number` | `1` | `[0.1, 10]` overall formation scale |
| `bloomIntensity` | `number` | `1` | `[0, 5]` bloom strength; `0` disables the bloom composer |
| `opacity` | `number` | `1` | `[0, 1]` field opacity |
| `backgroundColor` | `string` | `"transparent"` | Clear color behind the particles |
| `autoRotate` | `boolean` | `false` | Rotate the formation continuously |
| `rotationSpeed` | `number` | `1` | `[0, 10]` auto-rotation rate |
| `interactive` | `boolean` | `false` | Subtle pointer-reactive deformation |
| `interactionStrength` | `number` | `1` | `[0, 5]` pointer deformation strength |
| `seed` | `number` | `1` | Deterministic generation seed |
| `paused` | `boolean` | `false` | Freeze the animation clock |
| `maxPixelRatio` | `number` | `2` | `[1, 3]` device pixel ratio cap |
| `quality` | `OrganicParticleQuality` | `"auto"` | `"auto"` adapts to the device, or force `"low"` / `"medium"` / `"high"` |
| `fallback` | `ReactNode` | `null` | Shown when WebGL is unavailable or the context is lost |
| `className` | `string` | — | Class applied to the wrapper element |
| `style` | `CSSProperties` | — | Inline styles applied to the wrapper element |
| `onReady` | `() => void` | — | Called once the field has initialized |
| `"aria-label"` | `string` | — | Exposes the field to assistive tech; decorative (`aria-hidden`) otherwise |

Numeric props are clamped to their documented ranges. The same seed and props always produce the same field.

### How density, speed and entropy map to shader behavior

- **density** changes the particle count only. Formation size, shape and motion are identical at any density.
- **speed** is a multiplier on the shader time uniform. The animation runs faster or slower; paths and geometry do not change.
- **entropy** is the master disorder control. It smoothly lerps noise frequency, noise amplitude, curl strength, octave count, local displacement, and per-axis / phase variation. At `0` the formation is calm and coherent; at `1` it is a turbulent cloud.

## Presets

| Preset | Look |
| --- | --- |
| `soft-blob` | Calm rounded blob with gentle morphing (default) |
| `nebula` | Deep-space cloud with wide dispersion and strong bloom |
| `vortex` | Swirling spiral with rotational flow |
| `wave` | Undulating ripples across the formation |
| `chaos` | High-turbulence, rapidly shifting disorder |
| `svg` | Particles trace an SVG outline — pair with `svgPath` |

A preset is a starting point: any explicit prop overrides the preset value.

Soft blob:

```tsx
<OrganicParticleField
  preset="soft-blob"
  colors={["#bae6fd", "#0284c7", "#ffffff"]}
  density={0.7}
  speed={0.35}
  entropy={0.25}
/>
```

Nebula:

```tsx
<OrganicParticleField
  preset="nebula"
  colors={["#020617", "#1d4ed8", "#22d3ee", "#ffffff"]}
  density={0.9}
  speed={0.55}
  entropy={0.75}
  bloomIntensity={1.6}
  backgroundColor="#020617"
/>
```

Chaos:

```tsx
<OrganicParticleField
  preset="chaos"
  colors={["#8b5cf6", "#ec4899", "#38bdf8"]}
  density={0.8}
  speed={1.2}
  entropy={1}
  interactive
/>
```

## SVG shapes

With `preset="svg"`, particles trace the outline of an SVG shape instead of a procedural formation:

```tsx
<OrganicParticleField
  preset="svg"
  svgPath="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"
  colors={["#f472b6", "#ec4899", "#ffffff"]}
  density={0.6}
  speed={0.4}
  entropy={0.2}
/>
```

- Points are sampled uniformly by arc length along all subpaths, then auto-centered and uniformly scaled to the standard formation size; the Y axis is flipped (SVG is y-down). Sampling is deterministic for a given (`svgPath`, `density`, `seed`).
- Full `<svg>` markup is accepted as well; every path inside is used.
- Sampling runs client-side only (DOM APIs via three's SVGLoader). During SSR the component renders its `fallback` as usual.
- Missing or invalid `svgPath` input falls back to a blob formation.
- The `svg` preset ships calm tuned defaults (`speed` 0.5, `entropy` 0.2) so the silhouette stays readable; explicit props still override.
- Keep path complexity reasonable: very long or highly detailed paths cost sampling time without improving the silhouette.

## Controlled settings

Props are plain React state — drive them from controls:

```tsx
import { useState } from "react";
import { OrganicParticleField } from "@lexdotdev/react-organic-particles";

export function ControlledField() {
  const [density, setDensity] = useState(0.5);
  const [entropy, setEntropy] = useState(0.5);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <OrganicParticleField density={density} entropy={entropy} />
      <label>
        Density
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={density}
          onChange={(e) => setDensity(Number(e.target.value))}
        />
      </label>
      <label>
        Entropy
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={entropy}
          onChange={(e) => setEntropy(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
```

## Imperative handle

The component accepts a ref exposing four methods:

| Method | Effect |
| --- | --- |
| `pause()` | Freeze the animation clock |
| `resume()` | Unfreeze the animation clock |
| `reset()` | Restart the animation from `t = 0` |
| `setTime(time)` | Jump the animation clock to `time` |

```tsx
import { useRef } from "react";
import { OrganicParticleField } from "@lexdotdev/react-organic-particles";
import type { OrganicParticleFieldHandle } from "@lexdotdev/react-organic-particles";

export function ResettableField() {
  const fieldRef = useRef<OrganicParticleFieldHandle>(null);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <OrganicParticleField ref={fieldRef} />
      <button type="button" onClick={() => fieldRef.current?.reset()}>
        Reset
      </button>
    </div>
  );
}
```

Prefer the `paused` prop for declarative pausing; use the handle for transient commands such as `reset()` and `setTime()`.

## Transparent background

The default `backgroundColor` is `"transparent"`: the parent or page background shows through, so the field can float over existing content.

```tsx
<div
  style={{
    position: "relative",
    height: "100vh",
    background: "linear-gradient(#0f172a, #1e293b)",
  }}
>
  <OrganicParticleField opacity={0.9} />
</div>
```

## Light background

On light backgrounds, use a deeper palette and reduce bloom — additive glow on a bright clear color washes out quickly.

```tsx
<OrganicParticleField
  colors={["#1d4ed8", "#7c3aed", "#0f766e"]}
  backgroundColor="#f8fafc"
  bloomIntensity={0.4}
  density={0.6}
/>
```

## Dark nebula

```tsx
<OrganicParticleField
  preset="nebula"
  colors={["#020617", "#1d4ed8", "#22d3ee", "#ffffff"]}
  density={0.9}
  speed={0.55}
  entropy={0.75}
  bloomIntensity={1.6}
  backgroundColor="#020617"
/>
```

## Next.js

Importing the package is SSR-safe: no browser globals are touched at module scope. In the app router, mark the consuming component as a client component:

```tsx
"use client";

import { OrganicParticleField } from "@lexdotdev/react-organic-particles";

export function Hero() {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <OrganicParticleField preset="nebula" />
    </div>
  );
}
```

For maximum safety — or to keep Three.js out of the server bundle — load it with `next/dynamic`:

```tsx
"use client";

import dynamic from "next/dynamic";

const OrganicParticleField = dynamic(
  () =>
    import("@lexdotdev/react-organic-particles").then(
      (mod) => mod.OrganicParticleField,
    ),
  { ssr: false },
);
```

## Performance recommendations

- `density` maps to particle count: ~8k at `0` up to ~120k at `1` on desktop, ~4k–35k on mobile. Start at `0.5` and raise it until the frame rate dips.
- `quality="auto"` picks settings per device. Force `quality="low"` for heavy pages or embedded widgets.
- `maxPixelRatio` caps the device pixel ratio (default `2`). Render cost scales with the square of the ratio; `1.5` or `1` is a large saving on high-DPI screens.
- Bloom is a fullscreen postprocessing pass. `bloomIntensity={0}` removes the composer and its cost entirely.
- Offscreen behavior is automatic: rendering pauses when the tab is hidden or the field scrolls out of the viewport. No extra code needed.
- Keep `seed` stable across renders — changing it regenerates all particle geometry. Avoid remounting the component for the same reason.
- Memoize `colors` if you compute it; a new array identity every render forces a gradient rebuild.
- The renderer enables `preserveDrawingBuffer` so the canvas can be captured (screenshots, GIF export). The cost is negligible on modern GPUs.

## Reduced motion

When the OS or browser reports `prefers-reduced-motion`, the field renders a single static frame and the animation loop stays idle. Rendering also pauses automatically when the tab is hidden or the component is scrolled out of view. No props are required for either behavior.

## Browser support

Works in current evergreen browsers (Chrome, Edge, Firefox, Safari, including iOS Safari) with WebGL1 or WebGL2. Where WebGL is unavailable — or the GPU context is lost — the component renders the `fallback` prop instead:

```tsx
<OrganicParticleField fallback={<p>Interactive background unavailable.</p>} />
```

## Troubleshooting

- **Blank canvas** — the parent almost certainly has no height. The field is 100% x 100%; give the parent explicit dimensions.
- **Washed-out or blown highlights** — lower `bloomIntensity` (the bloom threshold is tuned for dark backgrounds). On light backgrounds use `0.3`–`0.5`, or `0` to disable bloom.
- **Nothing moves** — check the `paused` prop or a `pause()` call, `speed={0}`, and OS-level reduced motion, which forces a static frame.
- **The svg preset shows a blob** — `svgPath` is missing or failed to parse. Validate the path data in an SVG viewer.
- **Exported GIF has hard glow edges on a transparent background** — GIF alpha is 1-bit; semi-transparent glow pixels are quantized to fully on or off. Export over a solid `backgroundColor` for softer edges.
- **Field disappears after a GPU reset** — the context was lost; the component renders `fallback` in this state. Remounting recreates the context.
- **"Multiple instances of Three.js" warning or broken rendering** — more than one copy of `three` is installed. Run `npm dedupe three` (or the yarn/pnpm equivalent) and keep a single version.
- **Particles regenerate unexpectedly** — `seed` or `colors` changed identity. Keep the seed constant and memoize computed color arrays.

## Development

```bash
npm run dev       # playground with live reload
npm run validate  # format check, lint, typecheck, tests, build
npm run test      # unit tests
npm run build     # library bundle
```

The repo uses Biome for formatting and linting (`npm run format`, `npm run lint`). The playground in `playground/` has a light, minimal UI: it exercises every prop, generates copy-pasteable JSX, and can export the live field as an animated GIF (sidebar Export section — duration, fps, width; transparent backgrounds are preserved and quantized to GIF's 1-bit alpha).

## License

MIT
