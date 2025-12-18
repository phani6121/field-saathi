import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  
  // Default credentials
  const defaultCredentials = {
    client: {
      email: 'client@fieldsaathi.com',
      password: 'client123'
    },
    vendor: {
      email: 'vendor@fieldsaathi.com',
      password: 'vendor123'
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType) {
      // User is already logged in, redirect to their dashboard
      const dashboardPath = userType === 'client' ? '/client-dashboard' : '/vendor-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [navigate]);

  const handleQuickFill = (type) => {
    setFormData({
      email: defaultCredentials[type].email,
      password: defaultCredentials[type].password
    });
    // Clear any errors
    setErrors({});
  };

  const handleAutoLogin = (role) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Store user type in localStorage
      localStorage.setItem('userType', role);
      localStorage.setItem('userEmail', defaultCredentials[role].email);
      const dashboardPath = role === 'client' ? '/client-dashboard' : '/vendor-dashboard';
      // Normal navigation (not replace) to allow back button
      navigate(dashboardPath);
    }, 1500);
  };

  // Auto-fill credentials based on URL parameter
  useEffect(() => {
    const role = searchParams.get('role');
    const isDemo = searchParams.get('demo') === 'true';
    
    if (role && (role === 'client' || role === 'vendor')) {
      handleQuickFill(role);
      
      // If demo mode, auto-submit after a short delay
      if (isDemo) {
        const timer = setTimeout(() => {
          handleAutoLogin(role);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    // Check credentials
    const isClient = formData.email === defaultCredentials.client.email && 
                     formData.password === defaultCredentials.client.password;
    const isVendor = formData.email === defaultCredentials.vendor.email && 
                     formData.password === defaultCredentials.vendor.password;

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (isClient || isVendor) {
        // Store user type in localStorage
        const userType = isClient ? 'client' : 'vendor';
        localStorage.setItem('userType', userType);
        localStorage.setItem('userEmail', formData.email);
        const dashboardPath = userType === 'client' ? '/client-dashboard' : '/vendor-dashboard';
        // Normal navigation (not replace) to allow back button
        navigate(dashboardPath);
      } else {
        setErrors({ 
          email: 'Invalid credentials',
          password: 'Invalid credentials'
        });
      }
    }, 1500);
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div style={{ 
          position: 'absolute', 
          top: '0.5rem', 
          right: '0.5rem',
          zIndex: 10
        }}>
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: 'var(--text-secondary)',
              padding: '8px',
              '&:hover': {
                color: 'var(--primary-color)',
              },
              '@media (max-width: 480px)': {
                padding: '6px',
              }
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </div>
        <div className="signin-header">
          <Link to="/" className="logo-link">
            <h1>FieldSaathi <span className="brand-lite">Lite</span></h1>
          </Link>
          <h2>Sign In to Your Account</h2>
          <p>Welcome back! Please sign in to continue.</p>
          <div className="quick-fill-buttons">
            <button 
              type="button" 
              className="btn-quick-fill" 
              onClick={() => handleQuickFill('client')}
            >
              Use Client Account
            </button>
            <button 
              type="button" 
              className="btn-quick-fill" 
              onClick={() => handleQuickFill('vendor')}
            >
              Use Vendor Account
            </button>
          </div>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert('Forgot password functionality will be implemented'); }}>
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signin-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

