import { createPondWaterMaterial } from './islandWater';

test('water starts with quiet daylight and no active ripple', () => {
  const water = createPondWaterMaterial();
  expect(water.isShaderMaterial).toBe(true);
  expect(water.uniforms.uTime.value).toBe(0);
  expect(water.uniforms.uNight.value).toBe(0);
  expect(water.uniforms.uRippleAge.value).toBe(-1);
  expect(water.uniforms.uRippleOrigin.value.toArray()).toEqual([0, 0]);
  water.dispose();
});

test('each scene owns independent water uniforms', () => {
  const first = createPondWaterMaterial(), second = createPondWaterMaterial();
  first.uniforms.uNight.value = 1;
  first.uniforms.uRippleOrigin.value.set(0.3, 0.2);
  expect(second.uniforms.uNight.value).toBe(0);
  expect(second.uniforms.uRippleOrigin.value.toArray()).toEqual([0, 0]);
  first.dispose(); second.dispose();
});
