import React from 'react';

const PerfectFor = () => {
  const categories = [
    'Local BTL Agencies',
    'Real Estate Marketers',
    'EdTech Coaching Centres',
    'Political Coordinators'
  ];

  return (
    <section className="perfect-for">
      <div className="container">
        <h2 className="section-title">Perfect For</h2>
        <div className="perfect-for-grid">
          {categories.map((category, index) => (
            <div key={index} className="perfect-for-item">
              <h3>{category}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerfectFor;




