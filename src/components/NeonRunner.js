import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { WIDTH, HEIGHT, PLAYER_Y, laneX, createGame, scoreOf, stepGame } from './runnerEngine';
import './NeonRunner.css';

const BEST_KEY = 'portfolio-neon-runner-best';
const readBest = () => {
  try { const value = Number(localStorage.getItem(BEST_KEY)); return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0; }
  catch { return 0; }
};

function draw(ctx, game, reduced) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#091426';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(180, 100, 5, 180, 160, 280);
  glow.addColorStop(0, '#153767'); glow.addColorStop(1, '#091426');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = '#244168'; ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  const offset = reduced ? 0 : (game.time * 55) % 40;
  ctx.strokeStyle = '#183253';
  for (let y = offset; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
  for (const row of game.rows) {
    for (let lane = 0; lane < 3; lane++) {
      const x = laneX(lane);
      if (lane !== row.safe) {
        ctx.fillStyle = '#be365d'; ctx.fillRect(x - 27, row.y - 15, 54, 30);
        ctx.strokeStyle = '#ff93b1'; ctx.strokeRect(x - 27, row.y - 15, 54, 30);
        ctx.fillStyle = '#ff93b1'; ctx.fillRect(x - 19, row.y - 2, 38, 4);
      } else if (row.crystal) {
        ctx.fillStyle = '#6ff9d2'; ctx.beginPath();
        ctx.moveTo(x, row.y - 12); ctx.lineTo(x + 9, row.y); ctx.lineTo(x, row.y + 12); ctx.lineTo(x - 9, row.y); ctx.closePath(); ctx.fill();
      }
    }
  }
  const x = laneX(game.lane);
  ctx.shadowColor = game.dead ? '#ff648f' : '#57c5ff'; ctx.shadowBlur = 18;
  ctx.fillStyle = game.dead ? '#ff648f' : '#72d3ff'; ctx.fillRect(x - 13, PLAYER_Y - 13, 26, 26);
  ctx.shadowBlur = 0; ctx.strokeStyle = '#e6faff'; ctx.strokeRect(x - 9, PLAYER_Y - 9, 18, 18);
  if (!reduced) for (const spark of game.sparks) {
    ctx.globalAlpha = spark.life / 0.4; ctx.fillStyle = '#6ff9d2';
    for (let i = 0; i < 6; i++) { const angle = i * Math.PI / 3; const radius = (0.4 - spark.life) * 100; ctx.fillRect(spark.x + Math.cos(angle) * radius, spark.y + Math.sin(angle) * radius, 3, 3); }
    ctx.globalAlpha = 1;
  }
}

export default function NeonRunner() {
  const panel = useRef(null);
  const canvas = useRef(null);
  const game = useRef(createGame());
  const phase = useRef('ready');
  const [status, setStatus] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const reduced = useReducedMotion();
  const changeStatus = useCallback(value => { phase.current = value; setStatus(value); }, []);
  const pause = useCallback(() => { if (phase.current === 'playing') changeStatus('paused'); }, [changeStatus]);

  const start = () => {
    if (status !== 'paused') { game.current = createGame(); setScore(0); }
    changeStatus('playing'); panel.current.focus({ preventScroll: true });
  };
  const move = direction => {
    if (phase.current !== 'playing') return;
    game.current.lane = Math.max(0, Math.min(2, game.current.lane + direction));
  };

  useEffect(() => {
    const node = panel.current;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    observer.observe(node);
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', pause); };
  }, [pause]);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(element.clientWidth * ratio);
      element.height = Math.round(element.clientHeight * ratio);
      ctx.setTransform(element.width / WIDTH, 0, 0, element.height / HEIGHT, 0, 0);
      draw(ctx, game.current, reduced);
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let frame; let last = null; let accumulated = 0; let lastScore = -1;
    const tick = time => {
      if (phase.current !== 'playing') return;
      const elapsed = last === null ? 0 : Math.min((time - last) / 1000, 0.1);
      last = time; accumulated += elapsed;
      while (accumulated >= 1 / 120 && !game.current.dead) { stepGame(game.current, 1 / 120); accumulated -= 1 / 120; }
      const currentScore = scoreOf(game.current);
      if (lastScore !== currentScore) { setScore(currentScore); lastScore = currentScore; }
      draw(ctx, game.current, reduced);
      if (game.current.dead) {
        const record = Math.max(readBest(), best, currentScore);
        setBest(record);
        try { localStorage.setItem(BEST_KEY, String(record)); } catch { /* The game works without storage. */ }
        changeStatus('over'); return;
      }
      frame = requestAnimationFrame(tick);
    };
    if (status === 'playing') frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [status, reduced, best, changeStatus]);

  return (
    <section className="neon-runner" ref={panel} tabIndex={0} aria-label="Neon Lane Runner game" aria-describedby="runner-instructions"
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) pause(); }}
      onKeyDown={event => {
        if (phase.current !== 'playing' || event.altKey || event.ctrlKey || event.metaKey) return;
        const key = event.key.toLowerCase();
        if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) {
          event.preventDefault(); if (!event.repeat) move(key === 'arrowleft' || key === 'a' ? -1 : 1);
        } else if (key === 'escape') { event.preventDefault(); pause(); }
      }}>
      <header className="runner-header"><div><span className="runner-eyebrow">A little play, a lot of possibility</span><h2>Neon Lane Runner<span aria-hidden="true"> ↗</span></h2></div><span className="runner-live">MINI ARCADE</span></header>
      <div className="runner-scoreboard"><div><span>Score</span><strong>{String(score).padStart(4, '0')}</strong></div><div><span>Personal best · this device</span><strong>{String(best).padStart(4, '0')}</strong></div>
        <button type="button" onClick={status === 'playing' ? pause : start} disabled={status !== 'playing' && status !== 'paused'}>{status === 'paused' ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="runner-stage">
        <canvas ref={canvas} aria-label="Three lanes: dodge pink barriers and collect green crystals" role="img" />
        {status !== 'playing' && <div className="runner-overlay"><div className="runner-overlay-card">
          <span className="runner-symbol" aria-hidden="true">◇</span>
          <h3>{status === 'ready' ? 'Make your move.' : status === 'paused' ? 'Take a breather.' : 'One more run?'}</h3>
          <p role="status">{status === 'ready' ? 'Three lanes. One glowing cube. How far can you go?' : status === 'paused' ? 'Your run is paused. Resume when you’re ready.' : `Run complete: ${score} points. Personal best: ${best}.`}</p>
          <button className="runner-play" type="button" onClick={start}>{status === 'ready' ? 'Play' : status === 'paused' ? 'Resume game' : 'Play Again'} <span aria-hidden="true">→</span></button>
        </div></div>}
      </div>
      <div className="runner-controls"><button type="button" disabled={status !== 'playing'} onClick={() => move(-1)} aria-label="Move left">←</button><p id="runner-instructions">Use <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd><span>or tap the arrows · Esc to pause</span></p><button type="button" disabled={status !== 'playing'} onClick={() => move(1)} aria-label="Move right">→</button></div>
      <div className="runner-legend"><span><i className="runner-crystal" /> Collect +25</span><span><i className="runner-barrier" /> Dodge barriers</span><span>+10 / second</span></div>
    </section>
  );
}
