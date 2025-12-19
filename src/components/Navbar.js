import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Dashboard as DashboardIcon, Logout as LogoutIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const type = localStorage.getItem('userType');
      const email = localStorage.getItem('userEmail');
      setUserType(type);
      setUserEmail(email);
    };
    
    checkAuth();
    // Listen for storage changes (when user logs in/out)
    window.addEventListener('storage', checkAuth);
    // Also check on location change
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Only add scroll listener on home page
    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    // Only scroll if we're on the home page
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    setUserType(null);
    setUserEmail(null);
    navigate('/');
  };

  // Don't show navbar on dashboard, signin, or signup pages
  if (location.pathname === '/dashboard' || location.pathname === '/vendor-dashboard' || location.pathname === '/client-dashboard' || location.pathname === '/signin' || location.pathname === '/signup') {
    return null;
  }

  // If user is logged in on home page, redirect to dashboard instead of showing header
  if (userType && location.pathname === '/') {
    // Don't show dashboard header on home page - just show regular navbar
    // User should be redirected to dashboard if logged in, but if they're here, show simple navbar
  }

  // Regular navbar for non-logged in users
  return (
    <nav className="navbar" style={{ boxShadow: isScrolled ? '0 2px 20px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>FieldSaathi <span className="brand-lite">Lite</span></h1>
          </Link>
        </div>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        </ul>
        <div className="nav-actions">
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--primary-color)',
              }
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

