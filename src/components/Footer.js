import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <motion.div
          className="footer-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="footer-text">
            <p>
              Made with <FaHeart className="heart-icon" /> by Amir Hamza
            </p>
            <p className="copyright">
              © {currentYear} All rights reserved.
            </p>
          </div>
          <div className="footer-social">
            <motion.a
              href='https://www.linkedin.com/in/amirhamza4085/'
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </motion.a>
            <motion.a
              href="mailto:ah408567@gmail.com"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Email"
            >
              <FaEnvelope />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

