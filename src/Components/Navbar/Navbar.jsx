import React, { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img
            width="64"
            height="64"
            src="https://img.icons8.com/dusk/64/chart.png"
            alt="chart"
          />
          Dash
        </div>
        <div className="navbar-right">
          <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
            <a href="/" className="navbar-link">
              Home
            </a>
            <a href="/" className="navbar-link">
              Dashboard
            </a>
            <a href="/" className="navbar-link">
              About
            </a>
          </div>

          <div className="navbar-auth">
            <button className="login-button">Login</button>
            <button className="signup-button">Sign up</button>
          </div>

          <div className="hamburger" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
