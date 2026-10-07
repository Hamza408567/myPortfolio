import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './IslandViewer.css';

function IslandIllustration() {
  return (
    <svg className="island-illustration" viewBox="0 0 400 360" role="img" aria-label="Illustration of a cozy cabin and trees on a floating island">
      <ellipse cx="200" cy="298" rx="94" ry="12" fill="#44727e" opacity=".12" />
      <path d="M72 188 114 254 198 287 281 250 330 182Z" fill="#747789" />
      <path d="m72 188 126 99-30-96m30 96 83-37-17-54" fill="#626478" />
      <ellipse cx="201" cy="181" rx="130" ry="53" fill="#89b27c" />
      <ellipse cx="250" cy="195" rx="46" ry="21" fill="#d9d8bc" /><ellipse cx="250" cy="195" rx="40" ry="17" fill="#67b8c3" />
      <path d="M134 172v-70h70v70Z" fill="#b68358" /><path d="m121 108 48-49 49 49Z" fill="#526e83" />
      <path d="M161 172v-37h21v37Z" fill="#594f48" /><path d="M143 118h15v19h-15Zm41 0h15v19h-15Z" fill="#ffd88c" />
      {[95, 239, 296].map((x, i) => <g key={x} transform={`translate(${x} ${i === 1 ? 109 : 157})`}><path d="M-3 24h6v-40h-6" fill="#795840" /><path d="m0-67-24 49h12l-19 30h62L12-18h12Z" fill={i === 1 ? '#467b64' : '#5b9067'} /></g>)}
      <g fill="#f2f3ee"><ellipse cx="82" cy="83" rx="32" ry="12" /><ellipse cx="77" cy="76" rx="17" ry="15" /><ellipse cx="309" cy="62" rx="27" ry="10" /><ellipse cx="304" cy="55" rx="15" ry="13" /></g>
    </svg>
  );
}

export default function IslandViewer() {
  const host = useRef(null);
  const api = useRef(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  const [status, setStatus] = useState('loading');
  const { theme } = useTheme();
  const night = theme === 'dark';
  const nightRef = useRef(night);
  const [hover, setHover] = useState('');
  const [message, setMessage] = useState('Every little detail has a little life.');

  useEffect(() => {
    let cancelled = false, inView = false;
    const updateVisibility = () => api.current?.setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateVisibility(); });
    observer.observe(host.current);
    document.addEventListener('visibilitychange', updateVisibility);
    import('./islandScene').then(({ createIslandScene }) => {
      if (cancelled) return;
      api.current = createIslandScene(host.current, {
        reducedMotion: reducedRef.current,
        initialNight: nightRef.current,
        onHover: setHover,
        onAction: setMessage,
        onError: () => { api.current = null; setStatus('fallback'); },
      });
      setStatus('ready'); updateVisibility();
    }).catch(() => { if (!cancelled) setStatus('fallback'); });
    return () => { cancelled = true; observer.disconnect(); document.removeEventListener('visibilitychange', updateVisibility); api.current?.dispose(); api.current = null; };
  }, []);

  useEffect(() => { reducedRef.current = reduced; api.current?.setReduced(reduced); }, [reduced]);
  useEffect(() => { nightRef.current = night; api.current?.setNight(night); }, [night]);
  const ready = status === 'ready';

  return (
    <section className={`island-viewer ${night ? 'island-night' : ''}`} aria-labelledby="island-title">
      <header className="island-header">
        <div><span className="island-eyebrow">A SMALL ESCAPE</span><h2 id="island-title">A Little World<span aria-hidden="true">.</span></h2></div>
        <span className="island-edition">01 / EXPLORE</span>
      </header>
      <div className="island-stage">
        <div className="island-sky-orb" aria-hidden="true" />
        <div className="island-horizon" aria-hidden="true" />
        <div className="island-canvas-host" ref={host} />
        {!ready && <div className="island-placeholder"><IslandIllustration /><p role="status">{status === 'loading' ? 'Growing a little world…' : 'A quiet glimpse. Interactive 3D isn’t available in this browser.'}</p></div>}
        {ready && <>
          <div className="island-time-label"><span aria-hidden="true">{night ? '☾' : '☀'}</span> {night ? 'After hours' : 'Golden morning'}</div>
          <div className="island-zoom" aria-label="View controls"><button type="button" aria-label="Zoom in" onClick={() => api.current?.zoom(1)}><FaPlus /></button><button type="button" aria-label="Zoom out" onClick={() => api.current?.zoom(-1)}><FaMinus /></button></div>
          <span className="island-hover" aria-hidden="true">{hover || 'Drag to explore · Tap to discover'}</span>
        </>}
      </div>
      <p className="island-message" role="status">{message}</p>
    </section>
  );
}
