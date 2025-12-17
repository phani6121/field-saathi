import React from 'react';

const Pricing = () => {
  const pricingPlans = [
    {
      title: 'Per Campaign Day',
      price: 'Rs. 3,000',
      priceRange: '- Rs. 5,000',
      features: [
        'GPS + Photo proof',
        'Daily branded report',
        'Real-time dashboard',
        'Supervisor support'
      ],
      featured: false
    },
    {
      title: 'Monthly Retainer',
      price: 'Rs. 15,000',
      priceRange: '- Rs. 30,000',
      features: [
        'Everything in per-day',
        'Unlimited campaigns',
        'Priority support',
        'Custom branding'
      ],
      featured: true
    }
  ];

  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <p className="section-subtitle">No complex tech stack required. We handle everything.</p>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>
              {plan.featured && <div className="badge">Best Value</div>}
              <h3 className="pricing-title">{plan.title}</h3>
              <div className="pricing-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-range">{plan.priceRange}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;



