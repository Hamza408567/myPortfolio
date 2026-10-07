import { createMeadowLayout, meadowPointAllowed, grassPush } from './islandGrass';

test('meadow is deterministic and leaves landmarks and paths clear', () => {
  const blades = createMeadowLayout();
  expect(blades).toEqual(createMeadowLayout());
  expect(blades.length).toBeGreaterThan(400);
  expect(blades.length).toBeLessThan(1560);
  blades.forEach(blade => {
    expect(meadowPointAllowed(blade.x, blade.z)).toBe(true);
    expect(blade.height).toBeGreaterThanOrEqual(0.12);
    expect(blade.height).toBeLessThanOrEqual(0.28);
  });
  [[0.85, 1], [-0.5, -0.55], [-0.35, 0.65], [3, 0]].forEach(([x, z]) => expect(meadowPointAllowed(x, z)).toBe(false));
});

test('grass bends away from the pointer with a bounded, smooth influence', () => {
  expect(grassPush(0.2, 0, { x: 0, z: 0 }).x).toBeGreaterThan(0);
  expect(grassPush(-0.2, 0, { x: 0, z: 0 }).x).toBeLessThan(0);
  expect(grassPush(0, -0.2, { x: 0, z: 0 }).z).toBeLessThan(0);
  expect(grassPush(0.4, 0, { x: 0, z: 0 }).x).toBeLessThan(grassPush(0.2, 0, { x: 0, z: 0 }).x);
  expect(grassPush(0, 0, { x: 0, z: 0 })).toEqual({ x: 0.24, z: 0 });
  expect(grassPush(0.65, 0, { x: 0, z: 0 })).toEqual({ x: 0, z: 0 });
  expect(grassPush(0, 0, null)).toEqual({ x: 0, z: 0 });
});
