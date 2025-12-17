import React from 'react';
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <section id="get-started" className="get-started">
      <div className="container">
        <div className="get-started-content">
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="get-started-subtitle">
            Start tracking your BTL campaigns today. No technical setup required.
          </p>
          <button className="btn btn-primary btn-large" onClick={handleSignUp}>
            Sign Up Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;

