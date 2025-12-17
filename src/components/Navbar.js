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

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    setUserType(null);
    setUserEmail(null);
    navigate('/');
  };

  // Don't show navbar on dashboard, signin, or signup pages
  if (location.pathname === '/dashboard' || location.pathname === '/signin' || location.pathname === '/signup') {
    return null;
  }

  // If user is logged in, show dashboard header
  if (userType && location.pathname === '/') {
    return (
      <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            FieldSaathi <span style={{ fontWeight: 300 }}>Lite</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 32, height: 32 }}>
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {userEmail}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {userType === 'client' ? 'Client' : 'Vendor'}
                </Typography>
              </Box>
            </Box>
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none' }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
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
          <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
          <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a></li>
          <li><a href="#pricing" onClick={(e) => handleSmoothScroll(e, '#pricing')}>Pricing</a></li>
          <li><a href="#demo" onClick={(e) => handleSmoothScroll(e, '#demo')}>Demo</a></li>
        </ul>
        <div className="nav-actions">
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: 'var(--text-secondary)',
              mr: 1,
              '&:hover': {
                color: 'var(--primary-color)',
              }
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <button className="btn btn-signin" onClick={handleSignIn}>Sign In</button>
        </div>
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

