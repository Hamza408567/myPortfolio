import { motion } from 'framer-motion';
import React from 'react';
import { FaCubes, FaGamepad, FaRocket, FaTools } from 'react-icons/fa';
import './Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Core Development',
      icon: <FaCubes />,
      color: '#3b82f6',
      skills: ['Unity', 'C#', '2D', '3D', 'Mobile Games', 'VR', 'AR', 'SOLID Principles'],
    },
    {
      title: 'Architecture & Tooling',
      icon: <FaTools />,
      color: '#8b5cf6',
      skills: ['Event-Driven Architecture', 'Design Patterns', 'Modular Systems', 'State Machines', 'Scriptable Objects', 'Internal Frameworks', 'Automated Tooling', 'CI/CD'],
    },
    {
      title: 'Gameplay Systems',
      icon: <FaGamepad />,
      color: '#10b981',
      skills: ['Interaction Systems', 'Abilities', 'Multiplayer', 'Inventory', 'Player Controls', 'AI', 'NPC Behavior', 'Vehicles', 'Cutscenes'],
    },
    {
      title: 'Optimization & Production',
      icon: <FaRocket />,
      color: '#f59e0b',
      skills: ['Performance Profiling', 'Low-End Device Optimization', 'Mobile Optimization', 'Crash Reduction', 'Asset Optimization', 'Memory Profiling', 'Art-to-Engineering Workflows'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.14 } },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  };

  return (
    <section id="skills" className="skills">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="section-subtitle">
            Technologies, systems, and workflows I use to build engaging games
          </p>
        </motion.div>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {skillCategories.map((category) => (
            <motion.article
              key={category.title}
              className="skill-category-card"
              style={{ '--category-color': category.color }}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="skill-category-header">
                <div className="skill-category-icon" aria-hidden="true">
                  {category.icon}
                </div>
                <h3 className="skill-category-title">{category.title}</h3>
              </div>

              <motion.ul
                className="skill-chips"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {category.skills.map((skill) => (
                  <motion.li
                    key={skill}
                    className="skill-chip"
                    variants={chipVariants}
                    whileHover={{ y: -2, scale: 1.03 }}
                  >
                    <span className="skill-chip-dot" aria-hidden="true" />
                    {skill}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
