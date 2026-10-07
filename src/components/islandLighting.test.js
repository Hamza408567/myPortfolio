import * as THREE from 'three';
import { alignSkyLight, celestialPosition, themeCabinLights } from './islandLighting';

test('light stays aligned with the visible sun through orbit, tilt, zoom and resize', () => {
  const light = new THREE.DirectionalLight(), target = new THREE.Vector3(0, 0.25, 0);
  for (const [width, height] of [[570, 570], [320, 320], [600, 450]]) {
    const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 60);
    for (const radius of [9.3, 15]) for (const polar of [0.55, 1.28]) for (const angle of [0, 1, 2, 3, 4, 5]) {
      camera.position.setFromSphericalCoords(radius, polar, angle).add(target);
      camera.lookAt(target);
      alignSkyLight(light, camera, target, width, height);
      const projected = light.position.clone().project(camera);
      expect(projected.x).toBeCloseTo(0.72 - 54 / width, 5);
      expect(projected.y).toBeCloseTo(0.84 - 54 / height, 5);
      expect(light.position.y).toBeGreaterThan(target.y);
      expect(light.target.position.equals(target)).toBe(true);
    }
  }
  light.dispose();
});

test('sun and moon exchange places along opposite halves of the same orbit', () => {
  const day = celestialPosition(0, false, 570, 570);
  const night = celestialPosition(1, true, 570, 570);
  expect(night.x).toBeCloseTo(day.x);
  expect(night.y).toBeCloseTo(day.y);
  expect(celestialPosition(0.5, false, 570, 570)).not.toEqual(day);
  for (const mix of [0, 0.25, 0.5, 0.75, 1]) {
    const sun = celestialPosition(mix, false, 570, 570), moon = celestialPosition(mix, true, 570, 570);
    expect(sun.x + moon.x).toBeCloseTo(0);
    expect(sun.y + moon.y).toBeCloseTo(-0.7);
  }
});

test('theme transitions restore automatic lights but repeated theme updates preserve clicks', () => {
  expect(themeCabinLights(false, true, false)).toBe(true);
  expect(themeCabinLights(true, false, true)).toBe(false);
  expect(themeCabinLights(true, true, false)).toBe(false);
  expect(themeCabinLights(false, false, true)).toBe(true);
});
