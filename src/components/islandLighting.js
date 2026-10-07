import * as THREE from 'three';

export function themeCabinLights(previousNight, nextNight, lamps) {
  return previousNight === nextNight ? lamps : nextNight;
}

// Match the fixed CSS sun/moon center (top:8%, right:14%, diameter:54px).
// OrbitControls rotates the camera, so the light must follow the same screen-space source.
export function celestialPosition(mix, moon, width, height) {
  const angle = (mix - (moon ? 1 : 0)) * Math.PI;
  const x = 0.72 - 54 / width, y = 1.19 - 54 / height;
  return { x: x * Math.cos(angle) - y * Math.sin(angle), y: x * Math.sin(angle) + y * Math.cos(angle) - 0.35 };
}

export function alignSkyLight(light, camera, target, width, height, mix = 0) {
  if (!width || !height) return;
  camera.updateMatrixWorld();
  const depth = camera.position.distanceTo(target) * 0.45;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
  const sky = celestialPosition(mix, mix > 0.5, width, height);
  light.position.set(sky.x * halfHeight * camera.aspect, sky.y * halfHeight, -depth)
    .applyMatrix4(camera.matrixWorld);
  light.target.position.copy(target);
  light.target.updateMatrixWorld();
}
