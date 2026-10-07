// Deterministic meadow layout keeps the cabin, pond and stepping stones clear.
export function meadowPointAllowed(x, z) {
  if (Math.hypot(x, z) > 2.65) return false;
  if (x > -1.4 && x < 0.45 && z > -1.35 && z < 0.62) return false;
  if (((x - 0.85) / 1.04) ** 2 + ((z - 1) / 0.8) ** 2 < 1) return false;
  for (let i = 0; i < 5; i++) {
    if (Math.hypot(x + 0.35 + i * 0.15, z - 0.65 - i * 0.32) < 0.26) return false;
  }
  return ![[-1.8, -0.6], [1.1, -1.2], [1.96, -0.25], [-1.95, 0.65]]
    .some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.23);
}

export function createMeadowLayout() {
  let seed = 408;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const blades = [];
  for (let i = 0; i < 520; i++) {
    const x = (random() - 0.5) * 5.3, z = (random() - 0.5) * 5.3;
    if (!meadowPointAllowed(x, z)) continue;
    for (let j = 0; j < 3; j++) {
      const bx = x + (random() - 0.5) * 0.1, bz = z + (random() - 0.5) * 0.1;
      if (meadowPointAllowed(bx, bz)) blades.push({ x: bx, z: bz, height: 0.12 + random() * 0.16, width: 0.035 + random() * 0.025, angle: random() * Math.PI, shade: random() });
    }
  }
  return blades;
}

export function grassPush(x, z, pointer, radius = 0.65) {
  if (!pointer) return { x: 0, z: 0 };
  const dx = x - pointer.x, dz = z - pointer.z, distance = Math.hypot(dx, dz);
  if (distance >= radius) return { x: 0, z: 0 };
  const strength = (1 - distance / radius) ** 2 * 0.24;
  return { x: distance > 0.001 ? dx / distance * strength : strength, z: distance > 0.001 ? dz / distance * strength : 0 };
}
