import * as THREE from 'three';

// Match the fixed CSS sun/moon center (top:8%, right:14%, diameter:54px).
// OrbitControls rotates the camera, so the light must follow the same screen-space source.
export function alignSkyLight(light, camera, target, width, height) {
  if (!width || !height) return;
  camera.updateMatrixWorld();
  const depth = camera.position.distanceTo(target) * 0.45;
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
  light.position.set((0.72 - 54 / width) * halfHeight * camera.aspect, (0.84 - 54 / height) * halfHeight, -depth)
    .applyMatrix4(camera.matrixWorld);
  light.target.position.copy(target);
  light.target.updateMatrixWorld();
}
