import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('client');

  const demoContent = {
    client: 'Client Dashboard: View campaigns, track field activities, review reports, and monitor real-time submissions from your vendors.',
    vendor: 'Event Vendor Dashboard: Submit field activities, upload geo-tagged photos, track your assignments, and view campaign details.'
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleTryDemo = () => {
    // Navigate to sign-in with role parameter and auto-fill credentials
    navigate(`/signin?role=${selectedRole}&demo=true`);
  };

  return (
    <section id="demo" className="demo">
      <div className="container">
        <div className="demo-content">
          <h2 className="demo-title">Demo</h2>
          <p className="demo-subtitle">Try the app without signing up</p>
          <div className="demo-options">
            <button
              className={`demo-btn ${selectedRole === 'client' ? 'active' : ''}`}
              onClick={() => handleRoleClick('client')}
            >
              Client
            </button>
            <button
              className={`demo-btn ${selectedRole === 'vendor' ? 'active' : ''}`}
              onClick={() => handleRoleClick('vendor')}
            >
              Event Vendor
            </button>
          </div>
          <div className="demo-preview">
            <p className="demo-text">{demoContent[selectedRole]}</p>
          </div>
          <div className="demo-actions">
            <button 
              className="btn btn-primary demo-try-btn"
              onClick={handleTryDemo}
            >
              Try Demo
            </button>
            <button 
              className="btn btn-secondary demo-signin-btn"
              onClick={() => navigate(`/signin?role=${selectedRole}`)}
            >
              Sign In as {selectedRole === 'client' ? 'Client' : 'Event Vendor'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;



