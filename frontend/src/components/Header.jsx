import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">LOLVibeCoder</span>
          </div>
          <nav className="nav">
            <a href="#about" className="nav-link">About</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#api" className="nav-link">API</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
