import { chooseFrogLanding, createFrogState, frogPathSafe, frogPointSafe, startFrogHop, updateFrog } from './islandFrog';

test('starts in the pond and flees from a nearby mouse', () => {
  const frog = createFrogState(), threat = { x: 0.9, z: 1 };
  expect(frogPointSafe(frog)).toBe(true);
  const target = chooseFrogLanding(frog, threat);
  expect(target).not.toBeNull();
  expect(frogPathSafe(frog, target)).toBe(true);
  expect(Math.hypot(target.x - threat.x, target.z - threat.z)).toBeGreaterThan(Math.hypot(frog.x - threat.x, frog.z - threat.z));
});

test('rejects walls, trunks, fence, scenery and island edge', () => {
  [{ x: -0.5, z: -0.55 }, { x: 1.1, z: -1.2 }, { x: 0, z: -2.08 }, { x: 2.6, z: 0 }]
    .forEach(point => expect(frogPointSafe(point)).toBe(false));
  expect(frogPathSafe({ x: -1.6, z: 1.4 }, { x: 0.3, z: -1.6 })).toBe(false);
  expect(chooseFrogLanding({ x: 9, z: 9 }, { x: 0, z: 0 })).toBeNull();
});

test('repeated pursuit never leaves the safe area or crosses obstacles', () => {
  let position = createFrogState();
  for (let i = 0; i < 150; i++) {
    const angle = i * 2.399;
    const target = chooseFrogLanding(position, { x: position.x + Math.cos(angle) * 0.1, z: position.z + Math.sin(angle) * 0.1 });
    expect(target).not.toBeNull();
    expect(frogPathSafe(position, target)).toBe(true);
    for (let j = 0; j <= 40; j++) expect(frogPointSafe({ x: position.x + (target.x - position.x) * j / 40, z: position.z + (target.z - position.z) * j / 40 })).toBe(true);
    position = target;
  }
});

test('hop timing is consistent at 30, 60 and 120 fps and cannot restart midair', () => {
  const results = [30, 60, 120].map(fps => {
    const state = createFrogState();
    expect(startFrogHop(state, { x: 0.9, z: 1 })).toBe(true);
    expect(startFrogHop(state, { x: 0.9, z: 1 })).toBe(false);
    for (let i = 0; i < fps; i++) updateFrog(state, 1 / fps);
    expect(state.hop).toBeNull();
    expect(frogPointSafe(state)).toBe(true);
    return state;
  });
  results.forEach(state => { expect(state.x).toBeCloseTo(results[0].x); expect(state.z).toBeCloseTo(results[0].z); expect(state.y).toBeCloseTo(results[0].y); });
});

test('reduced motion moves directly to a safe landing and settles a running hop', () => {
  const state = createFrogState();
  startFrogHop(state, { x: 0.9, z: 1 }, true);
  expect(state.hop).toBeNull();
  expect(frogPointSafe(state)).toBe(true);
  updateFrog(state, 1);
  startFrogHop(state, { x: state.x - 0.1, z: state.z });
  updateFrog(state, 0.016, true);
  expect(state.hop).toBeNull();
  expect(state.stretch).toBe(0);
});

test('crouches before takeoff, extends legs in flight and recovers after landing', () => {
  const state = createFrogState(), start = { x: state.x, z: state.z, y: state.y };
  startFrogHop(state, { x: 0.9, z: 1 });
  updateFrog(state, 0.1);
  expect(state.x).toBe(start.x);
  expect(state.z).toBe(start.z);
  expect(state.crouch).toBeGreaterThan(0.5);
  updateFrog(state, 0.2);
  expect(state.y).toBeGreaterThan(start.y + 0.25);
  expect(state.legExtension).toBeGreaterThan(0.5);
  expect(updateFrog(state, 0.4)).toBe(true);
  expect(state.crouch).toBeGreaterThan(0);
  expect(updateFrog(state, 0.2)).toBe(false);
  expect(state.hop).toBeNull();
  expect(state.crouch).toBe(0);
  expect(state.legExtension).toBe(0);
  expect(state.pitch).toBe(0);
});
