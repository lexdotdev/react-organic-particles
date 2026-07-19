import type { Path } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { SeededRandom } from "./seededRandom";

const SVG_NS = "http://www.w3.org/2000/svg";
const TARGET_SIZE = 2;
const XY_JITTER = 0.03;
const Z_THICKNESS = 0.03;

/**
 * Samples positions uniformly by arc length along every subpath.
 * Client-side only; returns false on any failure so callers fall back.
 */
export function sampleSvgPositions(
  out: Float32Array,
  svgPath: string | undefined,
  rng: SeededRandom,
): boolean {
  if (typeof DOMParser === "undefined") return false;
  const source = svgPath?.trim();
  if (!source) return false;
  const markup = source.includes("<")
    ? source
    : `<svg xmlns="${SVG_NS}"><path d="${source}"/></svg>`;

  let subPaths: Path[];
  try {
    const { paths } = new SVGLoader().parse(markup);
    subPaths = paths.flatMap((shapePath) => shapePath.subPaths);
  } catch {
    return false; // tolerant parse: treat failures as no geometry
  }

  const usable = subPaths
    .map((sub) => ({ sub, length: sub.getLength() }))
    .filter((entry) => Number.isFinite(entry.length) && entry.length > 0);
  if (usable.length === 0) return false;

  const ends = new Array<number>(usable.length);
  let total = 0;
  for (let i = 0; i < usable.length; i++) {
    total += usable[i].length;
    ends[i] = total;
  }

  const count = out.length / 3;
  const raw = new Float32Array(count * 2);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  // Stratified arc-length targets are monotonic, so a cursor walk is enough.
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const target = ((i + rng()) / count) * total;
    while (cursor < ends.length - 1 && target > ends[cursor]) cursor++;
    const start = cursor === 0 ? 0 : ends[cursor - 1];
    const localT = Math.min(1, Math.max(0, (target - start) / usable[cursor].length));
    const point = usable[cursor].sub.getPoint(localT);
    const x = point.x;
    const y = -point.y; // SVG is y-down; flip into three's y-up
    raw[i * 2] = x;
    raw[i * 2 + 1] = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const span = Math.max(maxX - minX, maxY - minY);
  if (!Number.isFinite(span) || span <= 0) return false;
  const scale = TARGET_SIZE / span;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  for (let i = 0; i < count; i++) {
    out[i * 3] = (raw[i * 2] - centerX) * scale + (rng() - 0.5) * XY_JITTER;
    out[i * 3 + 1] = (raw[i * 2 + 1] - centerY) * scale + (rng() - 0.5) * XY_JITTER;
    out[i * 3 + 2] = (rng() - 0.5) * Z_THICKNESS * 2;
  }
  return true;
}
