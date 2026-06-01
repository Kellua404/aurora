export const VERT_SRC = /* glsl */`
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const FRAG_SRC = /* glsl */`
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_speed;
uniform float u_scale;
uniform float u_warp;
uniform float u_octaves;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_grain;
uniform vec2  u_flow;
uniform float u_seed;
uniform vec3  u_palA;
uniform vec3  u_palB;
uniform vec3  u_palC;
uniform vec3  u_palD;

// --- Ashima 2D simplex noise (MIT) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, int oct) {
  float sum = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    sum  += amp * snoise(p * freq);
    freq *= 2.0;
    amp  *= 0.5;
  }
  return sum;
}

vec3 palette(float t) {
  return u_palA + u_palB * cos(6.28318 * (u_palC * t + u_palD));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  int oct = int(u_octaves);

  float t = u_time * u_speed;
  vec2 flow = u_flow * t;
  vec2 p = uv * u_scale + flow + u_seed;
  p += u_mouse * 0.6;

  vec2 q = vec2(fbm(p + vec2(0.0, 0.0), oct),
                fbm(p + vec2(5.2, 1.3), oct));
  vec2 r = vec2(fbm(p + u_warp * q + vec2(1.7, 9.2) + 0.15 * t, oct),
                fbm(p + u_warp * q + vec2(8.3, 2.8) - 0.12 * t, oct));
  float f = fbm(p + u_warp * r, oct);

  float v = 0.5 + 0.5 * f;
  v = pow(clamp(v, 0.0, 1.0), u_contrast);

  vec3 col = palette(v) * u_brightness;

  float vig = smoothstep(1.25, 0.2, length(uv));
  col *= mix(0.82, 1.0, vig);

  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))
                  + u_time) * 43758.5453);
  col += (g - 0.5) * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
