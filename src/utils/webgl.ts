let cached: boolean | null = null;

// Lazy client-only probe; SSR always reports unavailable.
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    cached = false; // getContext may throw on locked-down environments
  }
  return cached;
}
