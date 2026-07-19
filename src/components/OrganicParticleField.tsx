import { Canvas, type RootState } from "@react-three/fiber";
import type * as React from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useElementVisibility } from "../hooks/useElementVisibility";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSmoothedPointer } from "../hooks/useSmoothedPointer";
import { resolveFieldProps } from "../presets/presets";
import type { OrganicParticleFieldHandle, OrganicParticleFieldProps } from "../types";
import { parsePalette } from "../utils/colors";
import { isWebGLAvailable } from "../utils/webgl";
import { ParticleScene } from "./ParticleScene";

const ROOT_STYLE: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const FALLBACK_STYLE: React.CSSProperties = { width: "100%", height: "100%" };

// preserveDrawingBuffer allows canvas capture (screenshots, GIF).
const GL_OPTIONS = {
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true,
} as const;

const CAMERA = { position: [0, 0, 6] as [number, number, number], fov: 50 };

export const OrganicParticleField = forwardRef<
  OrganicParticleFieldHandle,
  OrganicParticleFieldProps
>(function OrganicParticleField(props, ref) {
  const settings = resolveFieldProps(props);
  const palette = parsePalette(settings.colors);

  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const pauseOverrideRef = useRef<boolean | null>(null);
  const readyFiredRef = useRef(false);
  const onReadyRef = useRef(props.onReady);
  const detachContextLostRef = useRef<(() => void) | null>(null);
  const [webglOk, setWebglOk] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const elementVisible = useElementVisibility(rootRef);
  const pointer = useSmoothedPointer(rootRef, settings.interactive);

  // Lazy client-side probe keeps SSR on the fallback path.
  useEffect(() => {
    setWebglOk(isWebGLAvailable());
  }, []);

  useEffect(() => {
    onReadyRef.current = props.onReady;
  }, [props.onReady]);

  // Declarative paused prop re-syncs the imperative override.
  useEffect(() => {
    if (pauseOverrideRef.current !== null && pauseOverrideRef.current !== settings.paused) {
      pauseOverrideRef.current = null;
    }
  }, [settings.paused]);

  useImperativeHandle(
    ref,
    () => ({
      pause() {
        pauseOverrideRef.current = true;
      },
      resume() {
        pauseOverrideRef.current = false;
      },
      reset() {
        timeRef.current = 0;
      },
      setTime(time: number) {
        timeRef.current = time;
      },
    }),
    [],
  );

  const handleReady = useCallback(() => {
    if (readyFiredRef.current) return;
    readyFiredRef.current = true;
    onReadyRef.current?.();
  }, []);

  const handleCreated = useCallback((state: RootState) => {
    const element = state.gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    element.addEventListener("webglcontextlost", onLost);
    detachContextLostRef.current = () => element.removeEventListener("webglcontextlost", onLost);
  }, []);

  useEffect(() => () => detachContextLostRef.current?.(), []);

  const ariaLabel = props["aria-label"];
  const rootStyle: React.CSSProperties = {
    ...ROOT_STYLE,
    ...(settings.backgroundColor !== "transparent"
      ? { background: settings.backgroundColor }
      : undefined),
    ...props.style,
  };

  const showFallback = !webglOk || contextLost;
  return (
    <div
      ref={rootRef}
      className={props.className}
      style={rootStyle}
      {...(ariaLabel ? { role: "img", "aria-label": ariaLabel } : { "aria-hidden": "true" })}
    >
      {showFallback ? (
        (props.fallback ?? <div style={FALLBACK_STYLE} />)
      ) : (
        <Canvas
          dpr={[1, settings.maxPixelRatio]}
          gl={GL_OPTIONS}
          camera={CAMERA}
          frameloop={pageVisible && elementVisible ? "always" : "never"}
          onCreated={handleCreated}
        >
          <ParticleScene
            settings={settings}
            palette={palette}
            pointer={pointer}
            timeRef={timeRef}
            pauseOverrideRef={pauseOverrideRef}
            reducedMotion={reducedMotion}
            onFirstFrame={handleReady}
          />
        </Canvas>
      )}
    </div>
  );
});
