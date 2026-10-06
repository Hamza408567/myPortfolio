import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaEnvelope, FaLinkedin, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const socialLinks = [
    {
      name: 'Email',
      icon: <FaEnvelope />,
      url: 'mailto:ah408567@gmail.com',
      color: '#EA4335',
    },
    {
      name: 'Phone',
      icon: <FaPhone />,
      url: 'tel:+923167740735',
      color: '#25D366',
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin />,
      url: 'https://www.linkedin.com/in/amirhamza4085/',
      color: '#0077B5',
    },
  ];

  const contactDetails = [
    { label: 'Email', value: 'ah408567@gmail.com', icon: <FaEnvelope /> },
    { label: 'Phone', value: '+92 316 7740735', icon: <FaPhone /> },
    { label: 'Preferred Location', value: 'Lahore, Pakistan', icon: <FaMapMarkerAlt /> },
  ];

  return (
    <section id="contact" className="contact">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="section-subtitle">
            Have a project in mind? Let's work together!
          </p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="contact-intro">
              <div className="contact-intro-icon" aria-hidden="true">
                <FaEnvelope />
              </div>
              <div>
                <h3>Get in Touch</h3>
                <p>
                  I'm always open to discussing new game projects, creative ideas, or
                  opportunities to collaborate on exciting game development ventures.
                </p>
              </div>
            </div>
            <div className="contact-details">
              {contactDetails.map((detail) => (
                <div className="contact-detail" key={detail.label}>
                  <div className="contact-detail-icon" aria-hidden="true">{detail.icon}</div>
                  <p>
                    <strong>{detail.label}</strong>
                    <span>{detail.value}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ '--social-color': social.color }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="social-icon">{social.icon}</div>
                  <span>{social.name}</span>
                  <FaArrowRight className="social-arrow" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

