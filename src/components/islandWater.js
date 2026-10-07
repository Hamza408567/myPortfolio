import * as THREE from 'three';

// A small procedural surface: no textures, reflection render passes or external assets.
export function createPondWaterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uNight: { value: 0 },
      uHover: { value: 0 },
      uRippleAge: { value: -1 },
      uRippleOrigin: { value: new THREE.Vector2() },
    },
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vPond;
      void main() {
        vPond = position.xy / 0.81;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uNight;
      uniform float uHover;
      uniform float uRippleAge;
      uniform vec2 uRippleOrigin;
      varying vec2 vPond;
      void main() {
        vec2 p = vPond;
        float edge = smoothstep(0.45, 1.0, length(p));
        vec3 deep = mix(vec3(0.025, 0.28, 0.34), vec3(0.015, 0.075, 0.15), uNight);
        vec3 shallow = mix(vec3(0.30, 0.72, 0.64), vec3(0.07, 0.30, 0.34), uNight);
        vec3 color = mix(deep, shallow, edge * 0.85);
        float wave = sin(p.x * 12.0 + p.y * 7.0 + uTime * 0.7)
                   + sin(p.y * 17.0 - p.x * 5.0 - uTime * 0.55);
        float caustic = pow(max(0.0, 1.0 - abs(wave) * 0.6), 14.0);
        color += vec3(0.12, 0.22, 0.17) * caustic * (0.24 + edge * 0.20) * (1.0 - uNight * 0.65);
        float reflection = exp(-pow((p.y - p.x * 0.25 - 0.2 + wave * 0.035) * 9.0, 2.0));
        color += mix(vec3(0.17, 0.23, 0.20), vec3(0.12, 0.20, 0.32), uNight) * reflection * 0.5;
        float shoreline = smoothstep(0.94, 0.975, length(p)) * (1.0 - smoothstep(0.98, 1.0, length(p)));
        color += vec3(0.25, 0.40, 0.33) * shoreline * 0.3;
        if (uRippleAge >= 0.0) {
          float distanceToClick = length((p - uRippleOrigin) * vec2(1.0, 0.73));
          float rings = 0.0;
          for (int i = 0; i < 3; i++) {
            float age = uRippleAge - float(i) * 0.19;
            float radius = max(age, 0.0) * 0.8;
            float line = 1.0 - smoothstep(0.008, 0.035, abs(distanceToClick - radius));
            rings += line * step(0.0, age) * (1.0 - smoothstep(0.1, 1.6, age));
          }
          color += vec3(0.36, 0.55, 0.58) * rings * (1.0 - smoothstep(0.85, 1.0, length(p)));
        }
        color += vec3(0.025, 0.065, 0.06) * uHover;
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
