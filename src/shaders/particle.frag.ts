export const particleFragmentShader = /* glsl */ `
uniform float uOpacity;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  if (dist > 0.5) discard;
  float falloff = smoothstep(0.5, 0.05, dist);
  float core = smoothstep(0.22, 0.0, dist);
  vec3 color = vColor * (0.75 + 0.6 * core);
  float alpha = falloff * uOpacity * vAlpha;
  gl_FragColor = vec4(color, alpha);
}
`;
