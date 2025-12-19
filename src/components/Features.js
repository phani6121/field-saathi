import React, { useEffect, useRef } from 'react';

const Features = () => {
  const featureCardsRef = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    featureCardsRef.current.forEach(card => {
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
      }
    });

    return () => {
      featureCardsRef.current.forEach(card => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  const features = [
    {
      icon: '📍',
      title: 'GPS Verification',
      description: 'Automatic location capture with every submission. Accurate GPS coordinates with timestamp.'
    },
    {
      icon: '📸',
      title: 'Geo-Tagged Photos',
      description: 'Capture and upload photos directly from the field. All photos are geo-tagged automatically.'
    },
    {
      icon: '📄',
      title: 'Branded PDF Reports',
      description: 'Generate professional daily reports with photos, GPS data, and activity summaries.'
    },
    {
      icon: '⚡',
      title: 'Real-Time Tracking',
      description: 'Monitor field activities in real-time. See submissions as they happen on the map.'
    },
    {
      icon: '✅',
      title: 'Activity Verification',
      description: 'Supervisors can verify and approve field activities. Complete audit trail maintained.'
    },
    {
      icon: '📋',
      title: 'Campaign Management',
      description: 'Organize activities by campaign. Track progress and completion for each client.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Everything You Need for Field Verification</h2>
        <p className="section-subtitle">
          From field capture to client reports, we handle the complete proof of execution workflow.
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              ref={el => featureCardsRef.current[index] = el}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;








