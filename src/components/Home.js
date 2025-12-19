import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const handleDemoClick = () => {
    setDemoDialogOpen(true);
  };

  const handleCreateAccountClick = () => {
    navigate('/signup');
  };

  const handleDemoOption = (role) => {
    setDemoDialogOpen(false);
    // Navigate to sign-in with role to pre-fill credentials (user must click sign in)
    navigate(`/signin?role=${role}`);
  };

  return (
    <div className="App">
      <Navbar />
      <Box className="home-container">
        <Box className="home-content">
          <Typography variant="h1" className="home-title">
            FieldSaathi <span className="brand-lite">Lite</span>
          </Typography>
          <Typography variant="h5" className="home-subtitle">
            BTL Proof of Execution as a Service
          </Typography>
          <Box className="home-buttons">
            <Button
              variant="contained"
              size="large"
              className="home-btn home-btn-demo"
              onClick={handleDemoClick}
            >
              Demo
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="home-btn home-btn-create"
              onClick={handleCreateAccountClick}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Demo Dialog */}
      <Dialog
        open={demoDialogOpen}
        onClose={() => setDemoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Choose Demo Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Select an account type to try the demo:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleDemoOption('client')}
              sx={{ minWidth: 150 }}
            >
              Client
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleDemoOption('vendor')}
              sx={{ minWidth: 150 }}
            >
              Agency
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;







