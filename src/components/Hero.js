import { motion } from 'framer-motion';
import React from 'react';
import { FaArrowDown, FaDownload } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      <motion.div
        className="hero-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="hero-content"
          variants={itemVariants}
        >
          <motion.div
            className="hero-badge"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span>👋 Hello, I'm</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            variants={itemVariants}
          >
            <span className="gradient-text">Amir Hamza</span>
            <br />
            Game Developer
          </motion.h1>

          <motion.p
            className="hero-description"
            variants={itemVariants}
          >
            Creating immersive and engaging game experiences with Unity.
            <br />
            Passionate about bringing creative visions to life through interactive gameplay.
          </motion.p>

          <motion.div
            className="hero-buttons"
            variants={itemVariants}
          >
            <motion.a
              href="/my_cv/Amir Hamza V8.pdf"
              download
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload /> Download CV
            </motion.a>
            <motion.button
              onClick={scrollToProjects}
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects <FaArrowDown />
            </motion.button>
          </motion.div>

          <motion.div
            className="hero-social"
            variants={itemVariants}
          >
            <motion.a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <span>LinkedIn</span>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          variants={itemVariants}
        >
          <motion.div
            className="floating-card"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="card-content">
              <div className="code-snippet">
                <div className="code-line">
                  <span className="code-keyword">class</span>{' '}
                  <span className="code-class">Developer</span> {'{'}
                </div>
                <div className="code-line indent">
                  <span className="code-keyword">String</span> name ={' '}
                  <span className="code-string">"Amir Hamza"</span>;
                </div>
                <div className="code-line indent">
                  <span className="code-keyword">String</span> role ={' '}
                  <span className="code-string">"Game Developer"</span>;
                </div>
                <div className="code-line indent">
                  <span className="code-keyword">List</span> stack = [<span className="code-string">"Unity"</span>, <span className="code-string">"C#"</span>];
                </div>
                <div className="code-line">{'}'}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <FaArrowDown />
      </motion.div>
    </section>
  );
};

export default Hero;

