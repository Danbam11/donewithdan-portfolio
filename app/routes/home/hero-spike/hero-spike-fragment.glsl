varying float vDisplacement;
varying vec3 vNormal;

void main() {
  float m = clamp(vDisplacement * 1.5 + 0.5, 0.0, 1.0);
  vec3 deep = vec3(0.02, 0.09, 0.30);
  vec3 cyan = vec3(0.10, 0.62, 0.90);
  vec3 violet = vec3(0.50, 0.30, 0.95);
  vec3 col = mix(deep, cyan, smoothstep(0.0, 0.55, m));
  col = mix(col, violet, smoothstep(0.55, 1.0, m));

  float light = clamp(
    dot(normalize(vNormal), normalize(vec3(0.5, 0.8, 0.6))) * 0.5 + 0.5,
    0.0,
    1.0
  );
  col *= 0.55 + 0.45 * light;

  gl_FragColor = vec4(col, 1.0);
}
