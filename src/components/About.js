import { motion } from 'framer-motion';
import React from 'react';
import { FaCubes, FaMobileAlt, FaRocket, FaUsers } from 'react-icons/fa';
import './About.css';

const About = () => {
  const focusAreas = [
    'Gameplay Architecture',
    'Mobile Optimization',
    'AI & NPC Systems',
    'Reusable Tooling',
  ];

  const highlights = [
    {
      icon: <FaCubes />,
      title: 'Scalable Systems',
      description: 'Modular gameplay architecture, reusable frameworks, and production-ready Unity solutions.',
    },
    {
      icon: <FaMobileAlt />,
      title: 'Performance Focused',
      description: 'Runtime, memory, asset, and low-end device optimization built into the development process.',
    },
    {
      icon: <FaUsers />,
      title: 'Cross-Functional',
      description: 'Close collaboration with designers and artists to turn creative requirements into shipped experiences.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.14 } },
  };

  const itemVariants = {
    hidden: { y: 36, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="section-subtitle">
            Building polished games through thoughtful systems and reliable engineering
          </p>
        </motion.div>

        <motion.div
          className="about-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.article className="about-profile" variants={itemVariants}>
            <div className="about-profile-accent" aria-hidden="true">
              <FaRocket />
            </div>
            <div className="about-eyebrow">
              <span className="about-status-dot" aria-hidden="true" />
              Senior Unity Developer
            </div>

            <h3 className="about-heading">
              I build game systems that feel great to play and stay dependable in production.
            </h3>

            <div className="about-copy">
              <p>
                I specialize in <strong>Unity and C# development</strong> across mobile, 2D, 3D,
                multiplayer, VR, and AR experiences. My work covers gameplay programming,
                AI and NPC behavior, vehicles, player interaction, inventory, and cutscene systems.
              </p>
              <p>
                Beyond individual features, I focus on <strong>scalable architecture and performance</strong>:
                applying SOLID principles, design patterns, state machines, Scriptable Objects,
                event-driven systems, profiling, and asset optimization to create maintainable games.
              </p>
              <p>
                I enjoy turning product and creative requirements into production-ready solutions,
                collaborating with designers and artists, and building internal tools that make the
                whole team faster and more consistent.
              </p>
            </div>

            <div className="about-focus-list" aria-label="Core focus areas">
              {focusAreas.map((area) => (
                <span className="about-focus-chip" key={area}>{area}</span>
              ))}
            </div>
          </motion.article>

          <motion.div className="about-highlights" variants={containerVariants}>
            {highlights.map((highlight) => (
              <motion.article
                className="about-highlight-card"
                key={highlight.title}
                variants={itemVariants}
                whileHover={{ y: -6, x: 3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <div className="about-highlight-icon" aria-hidden="true">
                  {highlight.icon}
                </div>
                <div>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
