import * as THREE from 'three';
import { alignSkyLight } from './islandLighting';

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
