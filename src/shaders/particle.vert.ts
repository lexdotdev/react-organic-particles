import { MAX_COLOR_SLOTS } from "../utils/colors";
import { NOISE_GLSL } from "./noise.glsl";

export const particleVertexShader = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uSpeed;
uniform float uEntropy;
uniform float uParticleSize;
uniform float uScale;
uniform vec2 uPointer;
uniform float uInteractionStrength;
uniform int uColorCount;
uniform vec3 uColors[${MAX_COLOR_SLOTS}];
uniform float uPixelRatio;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uCurlStrength;
uniform int uOctaves;
uniform float uShape;

attribute vec3 aRandom;

varying vec3 vColor;
varying float vAlpha;

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// Tent weights interpolate the palette without dynamic indexing.
vec3 paletteColor(float f) {
  float scaled = clamp(f, 0.0, 1.0) * float(uColorCount - 1);
  vec3 color = vec3(0.0);
  for (int i = 0; i < ${MAX_COLOR_SLOTS}; i++) {
    color += uColors[i] * max(0.0, 1.0 - abs(scaled - float(i)));
  }
  return color;
}

float shapeWeight(float target) {
  return max(0.0, 1.0 - abs(uShape - target));
}

void main() {
  vec3 pos = position * uScale;
  float t = uTime;
  float radius = length(position);

  vec3 flow = vec3(
    snoise(pos * uNoiseFreq + vec3(t * 0.13, aRandom.x, 0.0)),
    snoise(pos * uNoiseFreq + vec3(0.0, t * 0.11, aRandom.x + 31.7)),
    snoise(pos * uNoiseFreq + vec3(aRandom.x + 57.3, 0.0, -t * 0.09))
  );
  pos += flow * uNoiseAmp;

  float fold = fbm(pos * (uNoiseFreq * 0.6) + vec3(0.0, 0.0, t * 0.07), uOctaves);
  pos += normalize(position + vec3(1e-4)) * fold * uNoiseAmp * 0.8;

  // Curl-ish swirl: noise gradient crossed with a fixed axis.
  float e = 0.35;
  vec3 grad = vec3(
    snoise(pos + vec3(e, 0.0, 0.0)) - snoise(pos - vec3(e, 0.0, 0.0)),
    snoise(pos + vec3(0.0, e, 0.0)) - snoise(pos - vec3(0.0, e, 0.0)),
    snoise(pos + vec3(0.0, 0.0, e)) - snoise(pos - vec3(0.0, 0.0, e))
  ) / (2.0 * e);
  vec3 curlDir = normalize(cross(grad, vec3(0.31, 0.95, 0.22)) + vec3(1e-5));
  pos += curlDir * uCurlStrength * (0.05 + 0.25 * uEntropy);

  float wBlob = shapeWeight(0.0);
  float wNebula = shapeWeight(1.0);
  float wVortex = shapeWeight(2.0);
  float wWave = shapeWeight(3.0);
  float wChaos = shapeWeight(4.0);
  float wSvg = shapeWeight(5.0);

  pos *= 1.0 + wBlob * 0.045 * sin(t * 0.7 + aRandom.x);
  pos += wNebula * vec3(0.0, 0.0, snoise(vec3(pos.xy * 0.4, t * 0.05))) * 0.5;
  // Differential rotation: inner orbits faster than the rim.
  pos = rotateY(pos, wVortex * t * 0.3 / (0.4 + radius));
  pos.y += wWave * sin(pos.x * 1.7 + t * 0.9 + aRandom.x) * 0.16;
  // Extra flutter scales with speed but only re-times the noise.
  pos += wChaos * flow * smoothstep(0.3, 1.2, radius) * (0.4 + 0.2 * uSpeed);
  // Small z-ripple and breath keep the outline legible.
  pos.z += wSvg * sin(pos.x * 3.0 + t * 0.8 + aRandom.x) * 0.05;
  pos *= 1.0 + wSvg * 0.02 * sin(t * 0.5 + aRandom.x);

  // Pointer projected onto the z=0 plane; 3.0 approx half-view at z=0.
  vec2 toPointer = pos.xy - uPointer * 3.0;
  float pd = length(toPointer);
  float influence = exp(-pd * pd * 1.8) * uInteractionStrength;
  pos.xy += (toPointer / max(pd, 1e-3)) * influence * 0.3;
  pos.z += influence * 0.25;

  float mixFactor = fract(
    radius * 0.45 + fold * 0.3 + aRandom.z * 0.2 + length(pos - position * uScale) * 0.25
  );
  vColor = paletteColor(mixFactor);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float size = uParticleSize * aRandom.y * 18.0 * uPixelRatio;
  gl_PointSize = clamp(size / -mvPosition.z, 1.0, 64.0);
  vAlpha = smoothstep(20.0, 8.0, -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;
