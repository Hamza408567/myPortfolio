import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import './Projects.css';

const Projects = () => {
  const [imageErrors, setImageErrors] = useState({});
  // Helper function to get Play Store icon from package name
  // You can also directly provide imageUrl in the project object
  const getPlayStoreIcon = (playStoreUrl) => {
    if (!playStoreUrl) return null;
    try {
      // Extract package name from Play Store URL
      // Format: https://play.google.com/store/apps/details?id=com.package.name
      const match = playStoreUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        const packageName = match[1];
        // Use Google Play icon API - this is a common format
        // Note: You may need to use the actual icon URL from Play Store page
        return `https://play-lh.googleusercontent.com/${packageName}`;
      }
    } catch (e) {
      console.error('Error extracting Play Store icon:', e);
    }
    return null;
  };

  const projects = [
    // TODO: Replace these with your actual projects from CV
    // To get Play Store icon: 
    // 1. Go to your app's Play Store page
    // 2. Right-click on the app icon
    // 3. Copy image address
    // 4. Paste it in the imageUrl field below
    // OR use: https://play-lh.googleusercontent.com/[package-name] (may not always work)
    {
      title: 'Bus Simulator - Bus Games',
      description: 'Bus Simulator - Bus Games is a bus simulator game that allows you to drive a bus and navigate through the city.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.jimaapps.city.coach.bus.simulator.driving&hl=en&gl=US', // Add Play Store URL: https://play.google.com/store/apps/details?id=com.package.name
      imageUrl: 'https://play-lh.googleusercontent.com/P_UNHbhDZVoQ-HoXPRpMPvNSRpKy_wAt3S1pHFtqMT6qQyS-bJlPCJkbjGJEhanJU5c=w480-h960-rw', // Add direct icon image URL from Play Store (right-click icon > copy image address)
      fallbackEmoji: '🎮',
    },
    {
      title: 'Fashion Store Simulator 3D',
      description: 'Fashion Store Simulator 3D is a fashion store simulator game that allows you to manage a fashion store and sell clothes to customers.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.supermarket.fashion.clothing.store.simulator',
      imageUrl: 'https://play-lh.googleusercontent.com/8EsqayJkO9SJ-DxUoUZz8_wX0WWg5Kq0zV6cBMZO5K0ddDDYH76IH_elOC1isilIeIQ=w480-h960-rw',
      fallbackEmoji: '🎮',
    },
    {
      title: 'GT Bike Racing Real Bike Game',
      description: 'GT Bike Racing Real Bike Game is a bike racing game that allows you to race a bike and navigate through the city.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.gast.tron.bike.transform.car.race.sim',
      imageUrl: 'https://play-lh.googleusercontent.com/Ik32AWk-pfltP6XVPgjNDOX9WHYImXmFBNqc1KuUb1dPS1dP2kgB4FtvAUqp4-YNlLE=w480-h960-rw',
      fallbackEmoji: '🎮',
    },
    {
      title: 'Spider Superhero Rope Hero',
      description: 'Spider Superhero Rope Hero is a superhero action game that allows you to swing through the city and fight crime.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.gkstudio.flying.stickman.man.superhero.ropehero.transform',
      imageUrl: 'https://play-lh.googleusercontent.com/Mn1Uj1Sej_zn60L_VAE_VOEfgLsLknaTjsh0RmNx05FOUvmbv_qBtz-5-p3A61FJUMY=w480-h960-rw',
      fallbackEmoji: '🎮',
    },
    {
      title: 'Crime City Robbery Thief Games',
      description: 'Crime City Robbery Thief Games is a robbery thief game that allows you to rob a city and escape from the police.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.vinegargames.virtual.thief.simulator.game',
      imageUrl: 'https://play-lh.googleusercontent.com/dKreqgNdmLikZQdAT1M5LWPI2uawulF_9OVeRND_4QXlhGJ9maBt8ITWmF9shsqc4A=w480-h960-rw',
      fallbackEmoji: '🎮',
    },
    {
      title: 'Agent Hunt: Spy Shooter Game',
      description: 'Agent Hunt: Spy Shooter Game is a spy shooter game that allows you to complete missions and eliminate targets.',
      tech: ['Unity', 'C#', 'Game Development'],
      playStore: 'https://play.google.com/store/apps/details?id=com.agent.spy.ops.gun.shooter.action.game',
      imageUrl: 'https://play-lh.googleusercontent.com/YI58bPNQqtGbGq6wJYEjugaTL3OAWfHgJte7sBnVghmly4CC7zY8jZZ-02Xx8xdSx3w=w480-h960-rw',
      fallbackEmoji: '🎮',
    },
  ].map(project => ({
    ...project,
    imageUrl: project.imageUrl || getPlayStoreIcon(project.playStore) || null,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="projects" className="projects">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle">
            Some of my recent work and side projects
          </p>
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="project-card"
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="project-image">
                {project.imageUrl && !imageErrors[index] ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="project-icon-img"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      console.error('Image failed to load:', project.imageUrl, 'for project:', project.title);
                      setImageErrors(prev => ({ ...prev, [index]: true }));
                      e.target.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      // Image loaded successfully
                      const emojiDiv = e.target.parentElement.querySelector('.project-emoji');
                      if (emojiDiv) {
                        emojiDiv.style.display = 'none';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="project-emoji" 
                  style={{ display: (project.imageUrl && !imageErrors[index]) ? 'none' : 'block' }}
                >
                  {project.fallbackEmoji || '🎮'}
                </div>
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.playStore && (
                    <motion.a
                      href={project.playStore}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaExternalLinkAlt /> View on Play Store
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;

