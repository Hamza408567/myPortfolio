export const WIDTH = 360;
export const HEIGHT = 400;
export const PLAYER_Y = 330;
export const laneX = lane => 60 + lane * 120;
export const speedAt = time => 110 + 110 * Math.min(time / 90, 1);
export const scoreOf = game => Math.floor(game.time * 10) + game.collected * 25;
export const createGame = () => ({ time: 0, lane: 1, rows: [], spawnIn: 0.8, collected: 0, dead: false, sparks: [] });

// Each row arrives at least 1.1 seconds after the previous row, even at top speed.
export function makeRow(random = Math.random) {
  const safe = Math.floor(random() * 3);
  return { y: -30, safe, crystal: true };
}

export function stepGame(game, dt, random = Math.random) {
  if (game.dead) return;
  game.time += dt;
  const speed = speedAt(game.time);
  game.spawnIn -= dt;
  if (game.spawnIn <= 0) {
    game.rows.push(makeRow(random));
    game.spawnIn += 245 / speed;
  }
  for (const row of game.rows) {
    row.y += speed * dt;
    if (Math.abs(row.y - PLAYER_Y) < 27) {
      if (game.lane !== row.safe) { game.dead = true; break; }
      if (row.crystal) {
        row.crystal = false;
        game.collected += 1;
        game.sparks.push({ x: laneX(row.safe), y: PLAYER_Y, life: 0.4 });
      }
    }
  }
  game.rows = game.rows.filter(row => row.y < HEIGHT + 40);
  game.sparks = game.sparks.map(spark => ({ ...spark, life: spark.life - dt })).filter(spark => spark.life > 0);
}
