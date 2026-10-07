import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { FaArrowDown, FaDownload, FaLinkedinIn } from 'react-icons/fa';
import NeonRunner from './NeonRunner';
import './Hero.css';

export default function Hero() {
  const reduced = useReducedMotion();
  const scrollToProjects = () => document.getElementById('projects')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <motion.div className="hero-content" initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.55 }}>
          <div className="hero-badge"><span>👋 Hello, I'm</span></div>
          <h1 className="hero-title"><span className="gradient-text">Amir Hamza</span><br /><span className="hero-role">Game Developer</span></h1>
          <p className="hero-description">Creating immersive and engaging game experiences with Unity.<br />Passionate about bringing creative visions to life through interactive gameplay.</p>
          <div className="hero-buttons">
            <a href="/my_cv/Amir Hamza V8.pdf" download className="btn btn-primary"><FaDownload aria-hidden="true" /> Download CV</a>
            <button type="button" onClick={scrollToProjects} className="btn btn-secondary">View Projects <FaArrowDown aria-hidden="true" /></button>
          </div>
          <div className="hero-social"><a href="https://www.linkedin.com/in/amirhamza4085/" target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true" /><span>LinkedIn</span><span aria-hidden="true">↗</span></a></div>
          <div className="hero-play-note" aria-hidden="true"><span>IDEAS INTO INTERACTION</span><div>Go ahead. Play a little. <span>↗</span></div></div>
        </motion.div>
        <div className="hero-visual"><NeonRunner /></div>
      </div>
      <button type="button" className="hero-scroll" onClick={scrollToProjects} aria-label="Scroll to projects"><FaArrowDown aria-hidden="true" /></button>
    </section>
  );
}

