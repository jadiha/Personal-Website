import React from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Import the CSS file for styling

function Header() {
  return (
    <header>
      <nav>
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/experiences">Experiences</Link></li>
          <li><Link to="/blog">Blog</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
