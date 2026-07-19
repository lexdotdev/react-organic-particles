import { type RefObject, useEffect, useRef } from "react";

export interface SmoothedPointer {
  readonly current: { x: number; y: number };
  readonly target: { x: number; y: number };
  update(): void;
}

const LERP_FACTOR = 0.08;

// Refs only: pointer events never trigger React state updates.
export function useSmoothedPointer<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  enabled: boolean,
): SmoothedPointer {
  const stateRef = useRef({ current: { x: 0, y: 0 }, target: { x: 0, y: 0 } });
  const apiRef = useRef<SmoothedPointer | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const { target } = stateRef.current;
      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onLeave = () => {
      stateRef.current.target.x = 0;
      stateRef.current.target.y = 0;
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [elementRef, enabled]);

  if (apiRef.current === null) {
    const state = stateRef.current;
    apiRef.current = {
      current: state.current,
      target: state.target,
      update() {
        state.current.x += (state.target.x - state.current.x) * LERP_FACTOR;
        state.current.y += (state.target.y - state.current.y) * LERP_FACTOR;
      },
    };
  }
  return apiRef.current;
}
