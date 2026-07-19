import { applyPalette, GIFEncoder, quantize } from "gifenc";

export interface CaptureOptions {
  width?: number;
  fps?: number;
  duration?: number;
  backgroundColor?: string;
  onProgress?: (elapsed: number, total: number) => void;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Sample the live GL canvas on a fixed clock; preserveDrawingBuffer
// on the renderer makes each drawImage read back correctly.
export async function captureFrames(
  source: HTMLCanvasElement,
  options: CaptureOptions = {},
): Promise<ImageData[]> {
  const fps = options.fps ?? 20;
  const duration = options.duration ?? 3;
  const background = options.backgroundColor ?? "transparent";

  if (source.width === 0 || source.height === 0) {
    throw new Error("Source canvas has zero size");
  }

  const width = Math.min(options.width ?? 480, source.width);
  const height = Math.max(1, Math.round((width * source.height) / source.width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  const frameCount = Math.max(1, Math.round(fps * duration));
  const interval = 1000 / fps;
  const frames: ImageData[] = [];
  const startedAt = performance.now();

  for (let frame = 0; frame < frameCount; frame++) {
    ctx.clearRect(0, 0, width, height);
    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(source, 0, 0, width, height);
    frames.push(ctx.getImageData(0, 0, width, height));
    options.onProgress?.(((frame + 1) * interval) / 1000, duration);

    // Fixed-clock scheduling avoids accumulating drift.
    const wait = startedAt + (frame + 1) * interval - performance.now();
    if (wait > 0) await sleep(wait);
  }
  return frames;
}

export interface EncodeOptions {
  width: number;
  height: number;
  fps: number;
  transparent: boolean;
}

export function encodeGif(frames: ImageData[], options: EncodeOptions): Blob {
  const gif = GIFEncoder();
  const delay = Math.round(1000 / options.fps);
  const format = options.transparent ? "rgba4444" : "rgb565";

  for (const frame of frames) {
    const palette = options.transparent
      ? quantize(frame.data, 256, { format, oneBitAlpha: true })
      : quantize(frame.data, 256, { format });
    const index = applyPalette(frame.data, palette, format);

    // GIF alpha is 1-bit: one palette slot becomes fully transparent.
    const transparentIndex = options.transparent ? palette.findIndex((c) => c[3] === 0) : -1;

    gif.writeFrame(index, options.width, options.height, {
      palette,
      delay,
      repeat: 0,
      transparent: transparentIndex >= 0,
      transparentIndex: Math.max(transparentIndex, 0),
    });
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}
