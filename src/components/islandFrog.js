// Conservative footprints include the frog's full body clearance, not just its center.
const rectangles = [
  { minX: -1.65, maxX: 0.65, minZ: -1.52, maxZ: 0.79 }, // Cabin, roof and porch.
  { minX: -0.96, maxX: 0.72, minZ: -2.34, maxZ: -1.82 }, // Fence.
];
const circles = [
  ...[[-1.8, -0.6, 0.9], [1.1, -1.2, 1.12], [1.96, -0.25, 0.8], [-1.95, 0.65, 0.64]]
    .map(([x, z, scale]) => ({ x, z, radius: 0.66 * scale + 0.23 })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: -0.35 - i * 0.15, z: 0.65 + i * 0.32, radius: 0.39 })),
  ...Array.from({ length: 10 }, (_, i) => ({ x: Math.cos(i * 2.4) * 2.25, z: Math.sin(i * 2.4) * 2.25, radius: 0.39 })),
];

export function frogPointSafe({ x, z }) {
  return Number.isFinite(x) && Number.isFinite(z) && Math.hypot(x, z) < 2.48
    && !rectangles.some(r => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ)
    && !circles.some(c => Math.hypot(x - c.x, z - c.z) <= c.radius);
}

export function frogPathSafe(from, to) {
  if (!frogPointSafe(from) || !frogPointSafe(to)) return false;
  const dx = to.x - from.x, dz = to.z - from.z, lengthSquared = dx * dx + dz * dz;
  // Exact swept segment checks prevent jumping through obstacles even with clear endpoints.
  for (const c of circles) {
    const t = lengthSquared ? Math.max(0, Math.min(1, ((c.x - from.x) * dx + (c.z - from.z) * dz) / lengthSquared)) : 0;
    if (Math.hypot(from.x + dx * t - c.x, from.z + dz * t - c.z) <= c.radius) return false;
  }
  for (const r of rectangles) {
    let entry = 0, exit = 1;
    for (const [origin, delta, min, max] of [[from.x, dx, r.minX, r.maxX], [from.z, dz, r.minZ, r.maxZ]]) {
      if (Math.abs(delta) < 1e-9) { if (origin < min || origin > max) { entry = 2; break; } }
      else {
        const a = (min - origin) / delta, b = (max - origin) / delta;
        entry = Math.max(entry, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
      }
    }
    if (entry <= exit) return false;
  }
  // The island boundary is convex; clear endpoints keep the entire segment inside it.
  return true;
}

export function chooseFrogLanding(from, threat) {
  if (!frogPointSafe(from)) return null;
  const away = Math.atan2(from.z - threat.z, from.x - threat.x);
  const initialDistance = Math.hypot(from.x - threat.x, from.z - threat.z);
  let best = null, bestScore = -Infinity;
  for (const distance of [0.78, 0.58, 0.4, 0.25]) {
    for (let i = 0; i < 40; i++) {
      const angle = away + i * Math.PI * 2 / 40;
      const point = { x: from.x + Math.cos(angle) * distance, z: from.z + Math.sin(angle) * distance };
      if (!frogPathSafe(from, point)) continue;
      // Check onward exits too, so a hop does not end in a narrow dead-end.
      let exits = 0;
      for (let j = 0; j < 12; j++) {
        const a = j * Math.PI / 6;
        if (frogPathSafe(point, { x: point.x + Math.cos(a) * 0.3, z: point.z + Math.sin(a) * 0.3 })) exits++;
      }
      if (exits < 3) continue;
      const separation = Math.hypot(point.x - threat.x, point.z - threat.z) - initialDistance;
      const score = separation * 3 + exits * 0.025 + (2.48 - Math.hypot(point.x, point.z)) * 0.12;
      if (score > bestScore) { bestScore = score; best = point; }
    }
  }
  return best;
}

export function frogSurfaceHeight({ x, z }) {
  return ((x - 0.85) / 1.02) ** 2 + ((z - 1) / 0.8) ** 2 < 1 ? 0.325 : 0.25;
}

export function createFrogState() {
  const position = { x: 1.12, z: 1.05 };
  return { ...position, y: frogSurfaceHeight(position), hop: null, cooldown: 0, stretch: 0, crouch: 0, pitch: 0, legExtension: 0, heading: 0 };
}

export function startFrogHop(state, threat, reduced = false) {
  if (!threat || state.hop || state.cooldown > 0) return false;
  const target = chooseFrogLanding(state, threat);
  if (!target) return false; // Never force an unsafe hop.
  state.heading = Math.atan2(target.x - state.x, target.z - state.z);
  if (reduced) { Object.assign(state, target); state.y = frogSurfaceHeight(target); state.cooldown = 0.4; }
  else state.hop = { from: { x: state.x, z: state.z, y: state.y }, to: target, elapsed: 0, duration: 0.82, touchedDown: false };
  return true;
}

export function updateFrog(state, dt, reduced = false) {
  state.cooldown = Math.max(0, state.cooldown - dt);
  if (!state.hop) return false;
  const hop = state.hop;
  hop.elapsed += dt;
  const progress = reduced ? 1 : Math.min(1, hop.elapsed / hop.duration);
  // Gather the hind legs, launch, fly a ballistic arc, then absorb the landing.
  const flight = Math.max(0, Math.min(1, (progress - 0.18) / 0.62));
  const t = flight;
  state.x = hop.from.x + (hop.to.x - hop.from.x) * t;
  state.z = hop.from.z + (hop.to.z - hop.from.z) * t;
  state.stretch = Math.sin(flight * Math.PI);
  state.crouch = progress < 0.18 ? Math.sin(progress / 0.18 * Math.PI / 2)
    : progress < 0.8 ? 0 : Math.sin((progress - 0.8) / 0.2 * Math.PI);
  state.legExtension = flight > 0 && flight < 1 ? Math.sin(Math.min(1, flight / 0.18) * Math.PI / 2) * (1 - Math.max(0, (flight - 0.6) / 0.4)) : 0;
  state.pitch = flight > 0 && flight < 1 ? -0.32 * Math.cos(flight * Math.PI) : 0;
  // Clearance above both banks prevents intersecting the raised pond rim mid-hop.
  state.y = Math.max(frogSurfaceHeight(state), hop.from.y + (frogSurfaceHeight(hop.to) - hop.from.y) * t) + 4 * flight * (1 - flight) * 0.46;
  const landed = flight === 1 && !hop.touchedDown;
  if (landed) hop.touchedDown = true;
  if (progress === 1) { state.hop = null; state.cooldown = 0.35; state.stretch = 0; state.crouch = 0; state.pitch = 0; state.legExtension = 0; state.y = frogSurfaceHeight(state); }
  return landed;
}
