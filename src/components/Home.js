import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Demo from './Demo';
import Features from './Features';
import Pricing from './Pricing';
import PerfectFor from './PerfectFor';
import GetStarted from './GetStarted';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Demo />
      <Features />
      <Pricing />
      <PerfectFor />
      <GetStarted />
      <Footer />
    </div>
  );
};

export default Home;




