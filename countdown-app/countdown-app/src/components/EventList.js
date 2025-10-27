// src/components/Home.js
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./app.css";

const Home = () => {
  const { currentUser } = useAuth();

  const [testimonials] = useState([
    { id: 1, name: "Dr. Alemayehu Bekele", role: "CEO, Tech Solutions PLC", quote: "The MINT events platform revolutionized how we organize our conferences." },
    { id: 2, name: "Ms. Selamawit Assefa", role: "Director, Innovation Hub", quote: "Best event management system we've used in Ethiopia." },
    { id: 3, name: "Mr. Yohannes Tadesse", role: "Event Coordinator, Addis Chamber", quote: "Streamlined our entire event planning process with intuitive features." }
  ]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [events, setEvents] = useState([]);
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = {
    background: { color: "transparent" },
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: "#ffffff" },
      links: { enable: true, color: "#ffffff", distance: 150, opacity: 0.4, width: 1 },
      move: { enable: true, speed: 0.3 },
      size: { value: 4 },
      opacity: { value: 0.6 },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "grab" } },
      modes: { grab: { distance: 140, links: { opacity: 0.8 } } },
    },
    detectRetina: true,
  };

  // --- fetch events ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const q = query(collection(db, "events"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const now = new Date();
        list = list
          .filter((e) => new Date(e.fullDate) >= now)
          .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

        setEvents(list);
      } catch (err) {
        console.error("fetchEvents error:", err);
        alert("Error loading events: " + (err.message || err));
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // --- fetch dashboard ---
  useEffect(() => {
    if (!currentUser) return;
    const fetchDashboard = async () => {
      try {
        const q = collection(db, "users", currentUser.uid, "dashboard");
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDashboardEvents(list);
      } catch (err) {
        console.error("Error fetching dashboard events:", err);
      }
    };
    fetchDashboard();
  }, [currentUser]);

  // --- countdown ---
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdowns = {};
      events.forEach((event) => {
        const now = new Date();
        const eventDate = new Date(event.fullDate);
        const diff = eventDate - now > 0 ? eventDate - now : 0;
        newCountdowns[event.id] = {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(timer);
  }, [events]);

  // --- testimonial rotation ---
  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialTimer);
  }, [testimonials.length]);

  const addToDashboard = async (event) => {
    if (!currentUser) {
      alert("Please log in first!");
      return;
    }
    try {
      const dashboardRef = doc(db, "users", currentUser.uid, "dashboard", event.id);
      await setDoc(dashboardRef, {
        ...event,
        savedAt: new Date().toISOString(),
      });
      setDashboardEvents(prev => [...prev, { ...event, savedAt: new Date().toISOString() }]);
      alert(`✅ "${event.title}" added to your dashboard!`);
    } catch (err) {
      console.error("addToDashboard error:", err);
      alert("Failed to save event: " + (err.message || err));
    }
  };

  const removeFromDashboard = async (eventId) => {
    if (!currentUser) return;
    try {
      const dashboardRef = doc(db, "users", currentUser.uid, "dashboard", eventId);
      await deleteDoc(dashboardRef);
      setDashboardEvents(prev => prev.filter(e => e.id !== eventId));
      alert("❌ Event removed from your dashboard.");
    } catch (err) {
      console.error("removeFromDashboard error:", err);
      alert("Failed to remove event: " + (err.message || err));
    }
  };

  const isInDashboard = (eventId) => {
    return dashboardEvents.some(e => e.id === eventId);
  };

  // Format date like in the image: "Tuesday, October 14, 2025"
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="home-container">
      <div className="page-content">
        {/* Hero Section */}
        <section className="hero-section">
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
          />

          <div className="hero-content">
            <h1>MINT Events</h1>
            <p className="hero-subtitle">Discover Ethiopia's Premier Events</p>
            <p>Join the nation's most exciting conferences, exhibitions, and cultural gatherings</p>
            
            {events.length > 0 ? (
              <div className="countdown-timer">
                {/* Event title above countdown */}
                <div className="event-title">{events[0].title}</div>
                
                {/* Countdown timer */}
                <div className="timer-display">
                  <div className="time-unit">
                    <div className="time-value">
                      {countdowns[events[0].id]?.days?.toString().padStart(2, '0') || '00'}
                    </div>
                    <div className="time-label">Days</div>
                  </div>
                  <div className="time-unit">
                    <div className="time-value">
                      {countdowns[events[0].id]?.hours?.toString().padStart(2, '0') || '00'}
                    </div>
                    <div className="time-label">Hours</div>
                  </div>
                  <div className="time-unit">
                    <div className="time-value">
                      {countdowns[events[0].id]?.minutes?.toString().padStart(2, '0') || '00'}
                    </div>
                    <div className="time-label">Minutes</div>
                  </div>
                  <div className="time-unit">
                    <div className="time-value">
                      {countdowns[events[0].id]?.seconds?.toString().padStart(2, '0') || '00'}
                    </div>
                    <div className="time-label">Seconds</div>
                  </div>
                </div>
                
                {/* Event location and date */}
                <div className="event-location">
                  {events[0].location.toUpperCase()} • {formatEventDate(events[0].fullDate)}
                </div>
              </div>
            ) : (
              !loadingEvents && (
                <div className="countdown-timer no-events">
                  <h2>No Upcoming Events</h2>
                  <p>Check back later for new events!</p>
                </div>
              )
            )}
          </div>
          
          <div className="hero-scroll-indicator">
            <span>Scroll to explore</span>
            <div className="scroll-arrow"></div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="featured-events">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <p>Discover what's happening across Ethiopia</p>
          </div>
          
          {loadingEvents ? (
            <div className="loading-events">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <h3>No upcoming events</h3>
              <p>Check back later for new events being added to our platform.</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-image-container">
                    {event.imageURL ? (
                      <img src={event.imageURL} alt={event.title} className="event-image" />
                    ) : (
                      <div className="event-image-placeholder">
                        <span>Event Image</span>
                      </div>
                    )}
                    <div className="event-date">
                      {new Date(event.fullDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-location-small">📍 {event.location}</p>
                    <p className="event-description">{event.description}</p>
                    
                    {countdowns[event.id] && (
                      <div className="countdown-timer-small">
                        <div className="countdown-label">Starts in:</div>
                        <div className="timer-units">
                          {Object.entries(countdowns[event.id]).map(([unit, value]) => (
                            <div key={unit} className="time-unit-small">
                              <span className="time-value-small">{value.toString().padStart(2, '0')}</span>
                              <span className="time-label-small">{unit.charAt(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentUser ? (
                      isInDashboard(event.id) ? (
                        <button 
                          onClick={() => removeFromDashboard(event.id)} 
                          className="btn-remove-dashboard"
                        >
                          ✅ Saved to Dashboard
                        </button>
                      ) : (
                        <button 
                          onClick={() => addToDashboard(event)} 
                          className="btn-add-dashboard"
                        >
                          ➕ Save Event
                        </button>
                      )
                    ) : (
                      <button className="btn-login-prompt" disabled>
                        🔒 Login to Save
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="stat-item">
            <div className="stat-number">{events.length}+</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-label">Organizers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1K+</div>
            <div className="stat-label">Attendees</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Cities</div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials">
          <div className="section-header">
            <h2>What People Say</h2>
            <p>Hear from our community of event organizers and attendees</p>
          </div>
          
          <div className="testimonial-container">
            {testimonials.map((t, i) => (
              <div key={t.id} className={`testimonial${i === currentTestimonial ? " active" : ""}`}>
                <div className="testimonial-quote">"{t.quote}"</div>
                <div className="testimonial-author">
                  <strong>{t.name}</strong>, <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="testimonial-dots">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                className={`dot${i === currentTestimonial ? " active" : ""}`}
                onClick={() => setCurrentTestimonial(i)}
              ></button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;