import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    message: "",
    to_email: ""
  });
  const [status, setStatus] = useState("");

  // ✅ EmailJS Credentials
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_lb1m80e",
    TEMPLATE_ID: "template_bgclk4o",  
    PUBLIC_KEY: "fo0WdbJcvc7k616hy"
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs.sendForm(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      e.target,
      EMAILJS_CONFIG.PUBLIC_KEY
    )
    .then((response) => {
      console.log("✅ SUCCESS! Email sent:", response);
      setStatus(`✅ Message sent to ${formData.to_email} successfully!`);
      setFormData({ name: "", email: "", message: "", to_email: "" });
    })
    .catch((error) => {
      console.error("❌ EmailJS Error:", error);
      
      if (error.text?.includes("Forbidden")) {
        setStatus("❌ Domain not allowed. Please add localhost:3000 to EmailJS security settings.");
      } else if (error.text) {
        setStatus(`❌ ${error.text}`);
      } else {
        setStatus("❌ Failed to send message. Please try again.");
      }
    });
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Contact Us</h1>
      </header>

      <main className="content">
        <section className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-details">
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div>
                <strong>Tel:</strong> 
                <span>+251118132191</span>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <strong>Email:</strong> 
                <span>contact@mint.gov.et</span>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-globe"></i>
              <div>
                <strong>Website:</strong> 
                <span>www.mint.gov.et</span>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <strong>Address:</strong> 
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-form-section">
          <h2>Send us a Message</h2>
          <form onSubmit={sendEmail} className="contact-form">
            <div className="form-group">
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <input 
                type="email" 
                name="to_email" 
                placeholder="Recipient's Email Address" 
                value={formData.to_email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <textarea 
                name="message" 
                placeholder="Your Message" 
                rows="5"
                value={formData.message} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
          
          {status && (
            <div className={`status ${status.includes('✅') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}
        </section>

        <section className="social">
          <h2>Connect with Us</h2>
          <div className="social-icons">
            <a href="https://www.facebook.com/MInT.Ethiopia" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
              <span>Facebook</span>
            </a>
            {/* Fixed Twitter link - using the Ministry's official Twitter if available, or removed if not */}
            <a href="https://twitter.com/mint_ethiopia" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="https://www.linkedin.com/company/ministry-of-innovation-and-technology-ethiopia/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
              <span>LinkedIn</span>
            </a>
            <a href="https://www.youtube.com/@MinistryofInnovationandTechnol" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
              <span>YouTube</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;