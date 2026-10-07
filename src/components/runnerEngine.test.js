import { createGame, makeRow, scoreOf, speedAt, stepGame } from './runnerEngine';

test('survival and crystals award the specified points once', () => {
  const game = createGame(); game.spawnIn = 999;
  game.rows = [{ y: 329, safe: 1, crystal: true }];
  stepGame(game, 1 / 120); stepGame(game, 1 / 120);
  expect(game.collected).toBe(1);
  expect(scoreOf(game)).toBe(25);
  game.time = 12;
  expect(scoreOf(game)).toBe(145);
});

test('collision stops scoring and fresh runs reset state', () => {
  const game = createGame(); game.rows = [{ y: 329, safe: 0, crystal: true }];
  stepGame(game, 1 / 120);
  expect(game.dead).toBe(true);
  const score = scoreOf(game); stepGame(game, 2);
  expect(scoreOf(game)).toBe(score);
  expect(createGame().dead).toBe(false);
});

test('every row has a safe lane and speed is capped', () => {
  for (const value of [0, 0.4, 0.999]) expect([0, 1, 2]).toContain(makeRow(() => value).safe);
  expect(speedAt(0)).toBe(110);
  expect(speedAt(90)).toBe(220);
  expect(speedAt(300)).toBe(220);
});

test('fixed simulation steps are consistent across render rates and rows stay separated', () => {
  const run = fps => {
    const game = createGame(); let accumulator = 0;
    for (let frame = 0; frame < fps * 100; frame++) {
      accumulator += 1 / fps;
      while (accumulator >= 1 / 120) {
        stepGame(game, 1 / 120, () => 0.5); accumulator -= 1 / 120;
        for (let i = 1; i < game.rows.length; i++) expect(game.rows[i - 1].y - game.rows[i].y).toBeGreaterThan(235);
      }
    }
    expect(game.dead).toBe(false);
    return scoreOf(game);
  };
  expect(Math.abs(run(30) - run(120))).toBeLessThanOrEqual(1);
});
