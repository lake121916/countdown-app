import React from "react";
import "./Footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // ✅ ensure icons load

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About / Logo */}
        <div className="footer-about">
          <p>
            The government merged the former Ministry of Science and Technology 
            and the Ministry of Communication and Information Technology to form 
            the Ministry of Innovation and Technology in 2019.
          </p>
          <a
            href="https://www.ictpark.et"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-ref-link"
          >
            Visit Ethio ICT Park
          </a>
        </div>

        {/* Focus Areas */}
        <div className="footer-links">
          <h3>Focus Areas</h3>
          <ul>
            <li>Research</li>
            <li>Innovation</li>
            <li>Technology Transfer</li>
            <li>Digitalization</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact</h3>
          <ul>
            <li>Tel: +251118132191</li>
            <li>Email: contact@mint.gov.et</li>
            <li>Website: www.mint.gov.et</li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="footer-social">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/MInT.Ethiopia" className="social-circle facebook" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/MInT/" className="social-circle twitter" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.linkedin.com/company/ministry-of-innovation-and-technology-ethiopia/" className="social-circle linkedin" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://t.me/MInT/#" className="social-circle telegram" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-telegram-plane"></i>
            </a>
            <a href="https://www.youtube.com/@MinistryofInnovationandTechnol" className="social-circle youtube" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>©2025 MInT. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
