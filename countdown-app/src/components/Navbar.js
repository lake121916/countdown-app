// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png"; // ✅ replace with your actual logo name

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 25px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 🔹 Left: Logo + Title */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="MINT Logo"
          style={{
            width: "100px",
            height: "auto",
            objectFit: "contain",
          }}
        />
        <span
          style={{
            marginLeft: "12px",
            fontWeight: "700",
            fontSize: "22px",
            color: "#006400", // dark green for MINT vibe
            letterSpacing: "0.5px",
          }}
        >
          MINT Events
        </span>
      </div>

      {/* 🔹 Right: Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/about" style={linkStyle}>
          About Us
        </Link>
        <Link to="/contact" style={linkStyle}>
          Contact
        </Link>

        {!currentUser ? (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/signup" style={linkStyle}>
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {currentUser.role === "normal" && (
              <Link to="/dashboard" style={linkStyle}>
                Dashboard
              </Link>
            )}
            {currentUser.role === "worker" && (
              <Link to="/worker" style={linkStyle}>
                Worker Dashboard
              </Link>
            )}
            {currentUser.role === "head" && (
              <Link to="/head" style={linkStyle}>
                Head Panel
              </Link>
            )}
            {currentUser.role === "admin" && (
              <Link to="/admin" style={linkStyle}>
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: "#f8f8f8",
                transition: "0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0e0e0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8f8f8")
              }
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

// 🔹 Common link style
const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontWeight: "500",
  fontSize: "16px",
  transition: "0.2s",
};

export default Navbar;
