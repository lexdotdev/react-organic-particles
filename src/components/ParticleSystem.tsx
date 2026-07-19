import { useFrame } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector2 } from "three";
import type { Group } from "three";
import type { SmoothedPointer } from "../hooks/useSmoothedPointer";
import { getPreset, type ResolvedFieldProps, resolveShapeParams } from "../presets/presets";
import { particleFragmentShader } from "../shaders/particle.frag";
import { particleVertexShader } from "../shaders/particle.vert";
import { MAX_COLOR_SLOTS, type ParsedPalette } from "../utils/colors";
import { type DeviceClass, particleCount, resolveDensityRange } from "../utils/density";
import { generateParticles } from "../utils/particleGenerators";

export interface ParticleSystemProps {
  settings: ResolvedFieldProps;
  palette: ParsedPalette;
  deviceClass: DeviceClass;
  pointer: SmoothedPointer;
  timeRef: MutableRefObject<number>;
  pauseOverrideRef: MutableRefObject<boolean | null>;
  reducedMotion: boolean;
  onFirstFrame: () => void;
}

export function ParticleSystem({
  settings,
  palette,
  deviceClass,
  pointer,
  timeRef,
  pauseOverrideRef,
  reducedMotion,
  onFirstFrame,
}: ParticleSystemProps) {
  const groupRef = useRef<Group>(null);
  const firstFrameRef = useRef(false);
  const preset = getPreset(settings.preset);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uEntropy: { value: 0.5 },
      uParticleSize: { value: 1 },
      uScale: { value: 1 },
      uPointer: { value: new Vector2(0, 0) },
      uInteractionStrength: { value: 0 },
      uColorCount: { value: 1 },
      uColors: { value: new Float32Array(MAX_COLOR_SLOTS * 3) },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uNoiseFreq: { value: 1 },
      uNoiseAmp: { value: 0.4 },
      uCurlStrength: { value: 0.5 },
      uOctaves: { value: 3 },
      uShape: { value: 0 },
    }),
    [],
  );

  // count derives from density/quality, generator from preset: geometry
  // regenerates only when density, quality, preset, or seed change.
  const generator = preset.generator;
  const count = particleCount(settings.density, resolveDensityRange(settings.quality, deviceClass));
  const seed = settings.seed;
  // Only the svg generator consumes svgPath; gating avoids no-op regens.
  const svgPath = generator === "svg" ? settings.svgPath : undefined;
  const geometry = useMemo(() => {
    const { positions, randoms } = generateParticles(generator, count, seed, svgPath);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aRandom", new BufferAttribute(randoms, 3));
    return geo;
  }, [generator, count, seed, svgPath]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [uniforms],
  );

  // Separate effects: disposing the material while it is still in use
  // would force a shader recompile on every geometry regeneration.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    const shape = resolveShapeParams(preset, settings.entropy);
    uniforms.uSpeed.value = settings.speed;
    uniforms.uEntropy.value = settings.entropy;
    uniforms.uParticleSize.value = settings.particleSize;
    uniforms.uScale.value = settings.scale;
    uniforms.uInteractionStrength.value = settings.interactive ? settings.interactionStrength : 0;
    uniforms.uOpacity.value = settings.opacity;
    uniforms.uNoiseFreq.value = shape.noiseFreq;
    uniforms.uNoiseAmp.value = shape.noiseAmp;
    uniforms.uCurlStrength.value = shape.curlStrength;
    uniforms.uOctaves.value = shape.octaves;
    uniforms.uShape.value = shape.shape;
    uniforms.uColors.value.set(palette.values);
    uniforms.uColorCount.value = palette.count;
  });

  useFrame((state, delta) => {
    // Resuming after frameloop="never" reports the whole hidden
    // stretch as one delta; cap it so the field never jumps.
    const dt = Math.min(delta, 0.1);
    const paused = pauseOverrideRef.current ?? settings.paused;
    const frozen = paused || reducedMotion;
    if (!frozen) {
      timeRef.current += dt * settings.speed;
    }
    pointer.update();
    uniforms.uTime.value = timeRef.current;
    uniforms.uPointer.value.set(pointer.current.x, pointer.current.y);
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (settings.autoRotate && !frozen && groupRef.current) {
      groupRef.current.rotation.y += dt * settings.rotationSpeed * 0.2;
    }
    if (!firstFrameRef.current) {
      firstFrameRef.current = true;
      onFirstFrame();
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
