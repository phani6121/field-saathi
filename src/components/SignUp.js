import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType) {
      // User is already logged in, redirect to their dashboard
      const dashboardPath = userType === 'client' ? '/client-dashboard' : '/vendor-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    userType: 'client'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Account created successfully! You can now sign in.');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
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
        <div className="signup-header">
          <Link to="/" className="logo-link">
            <h1>FieldSaathi <span className="brand-lite">Lite</span></h1>
          </Link>
          <h2>Create Your Account</h2>
          <p>Start tracking your BTL campaigns today</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

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
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="Enter your phone number"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={errors.company ? 'error' : ''}
              placeholder="Enter your company name"
            />
            {errors.company && <span className="error-message">{errors.company}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="userType">I am a *</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="client">Client</option>
              <option value="vendor">Agency</option>
            </select>
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
              placeholder="Create a password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setSignInDialogOpen(true); }} style={{ color: 'var(--primary-color)', textDecoration: 'none', cursor: 'pointer' }}>Sign In</a></p>
        </div>
      </div>

      {/* Sign In Dialog */}
      <Dialog
        open={signInDialogOpen}
        onClose={() => setSignInDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Choose Account Type</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Select an account type to sign in:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setSignInDialogOpen(false);
                navigate('/signin?role=client');
              }}
              sx={{ minWidth: 150 }}
            >
              Client
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setSignInDialogOpen(false);
                navigate('/signin?role=vendor');
              }}
              sx={{ minWidth: 150 }}
            >
              Agency
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignInDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUp;

