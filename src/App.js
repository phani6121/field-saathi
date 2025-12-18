import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './contexts/ThemeContext';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

function App() {
  const { theme } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#4caf50',
        dark: '#388e3c',
      },
      secondary: {
        main: '#8bc34a',
      },
      background: {
        default: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        paper: theme === 'dark' ? '#2d2d2d' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#ffffff' : '#333333',
        secondary: theme === 'dark' ? '#b0b0b0' : '#666666',
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
            color: theme === 'dark' ? '#ffffff' : '#333333',
            transition: 'background-color 0.3s, color 0.3s',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/vendor-dashboard/*" element={<Dashboard />} />
          <Route path="/client-dashboard/*" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </Router>
    </MuiThemeProvider>
  );
}

export default App;

