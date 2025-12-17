import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';
import CreateCampaign from './CreateCampaign';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  // Auto-detect mobile and close sidebar by default on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    return !isMobile; // Open on desktop, closed on mobile
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [galleryFilters, setGalleryFilters] = useState({
    search: '',
    campaign: 'All Campaigns',
    campaignType: 'All Types',
    status: 'All Status'
  });
  const [campaignFilters, setCampaignFilters] = useState({
    search: '',
    campaignType: 'All Types',
    status: 'All Status',
    client: 'All Clients'
  });
  
  const userType = localStorage.getItem('userType') || 'client';
  const userEmail = localStorage.getItem('userEmail') || 'phanindra61214243@gmail.com';

  // Load campaigns and photos from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('campaigns');
    const savedPhotos = localStorage.getItem('photos');
    
    if (savedCampaigns) {
      try {
        setCampaigns(JSON.parse(savedCampaigns));
      } catch (e) {
        console.error('Error loading campaigns:', e);
      }
    }
    
  }, []);

  // Save campaigns to localStorage whenever they change
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);


  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/signin');
  };

  const stats = {
    activeCampaigns: campaigns.length,
    totalActivities: activities.length,
    photosUploaded: activities.reduce((sum, act) => sum + (act.photos || 0), 0),
    todayActivities: activities.filter(act => {
      const today = new Date().toDateString();
      return new Date(act.date).toDateString() === today;
    }).length
  };

  const handleCreateCampaign = (campaignData) => {
    const newCampaign = { ...campaignData, id: Date.now(), createdAt: new Date().toISOString() };
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    setShowCreateCampaign(false);
    
    // Save campaigns to localStorage immediately
    localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
  };

  // Check if location services are available
  const checkLocationAvailable = () => {
    if (!navigator.geolocation) {
      return { available: false, message: 'Geolocation is not supported by this browser' };
    }
    return { available: true };
  };

  // Get current GPS location with high accuracy
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const locationCheck = checkLocationAvailable();
      if (!locationCheck.available) {
        const error = new Error(locationCheck.message);
        console.error('GPS Error:', error.message);
        reject(error);
        return;
      }

      // First try: High accuracy with longer timeout
      const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout: 25000,            // 25 second timeout
        maximumAge: 0              // Don't use cached location
      };

      console.log('Attempting to get GPS location with high accuracy...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy, // in meters
            timestamp: new Date().toISOString()
          };
          console.log('GPS captured successfully:', {
            latitude: gpsData.latitude,
            longitude: gpsData.longitude,
            accuracy: `${Math.round(gpsData.accuracy)}m`
          });
          resolve(gpsData);
        },
        (error) => {
          console.warn('High accuracy GPS failed:', {
            code: error.code,
            message: error.message
          });

          // If high accuracy fails, try with cached/less accurate location
          const fallbackOptions = {
            enableHighAccuracy: false,  // Allow less accurate sources
            timeout: 15000,             // 15 second timeout
            maximumAge: 60000           // Accept location up to 1 minute old
          };

          console.log('Trying fallback GPS with cached location...');

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const gpsData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
              };
              console.log('GPS captured with fallback method:', {
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                accuracy: `${Math.round(gpsData.accuracy)}m`
              });
              resolve(gpsData);
            },
            (fallbackError) => {
              console.error('GPS capture failed completely:', {
                code: fallbackError.code,
                message: fallbackError.message,
                originalError: {
                  code: error.code,
                  message: error.message
                }
              });
              reject(fallbackError);
            },
            fallbackOptions
          );
        },
        highAccuracyOptions
      );
    });
  };

  const handleTakePhoto = (campaign) => {
    // First check if location is available
    const locationCheck = checkLocationAvailable();
    if (!locationCheck.available) {
      alert('⚠️ Location services are not available. Please enable location services in your device settings and browser permissions.');
      return;
    }

    // Request location permission early when camera opens
    console.log('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      () => {
        console.log('Location permission granted');
      },
      (error) => {
        if (error.code === 1) {
          alert('⚠️ Location permission is required!\n\nPlease enable location access in your browser settings to capture GPS coordinates with photos.\n\n1. Click the lock/location icon in your browser address bar\n2. Allow location access\n3. Try taking photo again');
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Check if getUserMedia is available (for camera access)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Try to access camera directly
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          // Create video element to show camera preview
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.playsInline = true;
          
          // Create modal for camera preview
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          `;
          
          video.style.cssText = `
            max-width: 100%;
            max-height: 70vh;
            border-radius: 10px;
          `;
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
          `;
          
          const captureBtn = document.createElement('button');
          captureBtn.textContent = '📸 Capture Photo';
          captureBtn.className = 'btn btn-primary';
          captureBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
          `;

          // Add location status indicator
          const locationStatus = document.createElement('div');
          locationStatus.style.cssText = `
            color: #4caf50;
            font-size: 0.85rem;
            margin-bottom: 1rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          `;
          locationStatus.innerHTML = '📍 Checking location...';
          
          // Check location status when camera opens
          navigator.geolocation.getCurrentPosition(
            () => {
              locationStatus.innerHTML = '✅ Location enabled';
              locationStatus.style.color = '#4caf50';
            },
            (error) => {
              if (error.code === 1) {
                locationStatus.innerHTML = '⚠️ Location permission denied - Enable in browser settings';
                locationStatus.style.color = '#ff9800';
              } else {
                locationStatus.innerHTML = '⚠️ Location unavailable - Enable location services';
                locationStatus.style.color = '#ff9800';
              }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
          
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.className = 'btn btn-secondary';
          cancelBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
          `;
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          captureBtn.onclick = async () => {
            // Capture the photo first
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            // Show loading indicator
            captureBtn.disabled = true;
            captureBtn.textContent = '📍 Getting location...';
            
            // Get GPS location with high accuracy
            let gpsData = null;
            let locationName = campaign.targetLocations ? campaign.targetLocations.split(',')[0].trim() : 'Unknown';
            
            try {
              gpsData = await getCurrentLocation();
              // Use GPS coordinates, keep campaign location as fallback name
              locationName = `${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}`;
              console.log('GPS data captured successfully:', gpsData);
            } catch (error) {
              console.error('GPS capture failed after all attempts:', {
                code: error.code,
                message: error.message,
                error: error
              });
              
              // Show specific error messages and instructions
              if (error.code === 1) {
                console.warn('Location permission denied by user');
                alert('⚠️ Location Permission Required!\n\nPlease enable location access:\n\n1. Click the lock/location icon in your browser address bar\n2. Select "Allow" for location\n3. Make sure device location services are ON\n4. Try capturing photo again\n\nPhoto cannot be saved without location.');
                // Stop photo capture if location is required
                captureBtn.disabled = false;
                captureBtn.textContent = '📸 Capture Photo';
                return;
              } else if (error.code === 2) {
                console.warn('Location unavailable - device cannot determine location');
                alert('⚠️ Location Unavailable!\n\nPlease enable location services on your device:\n\n1. Go to device Settings\n2. Enable Location/GPS\n3. Make sure you are outdoors or have clear sky view\n4. Try again\n\nPhoto cannot be saved without location.');
                captureBtn.disabled = false;
                captureBtn.textContent = '📸 Capture Photo';
                return;
              } else if (error.code === 3) {
                console.warn('Location request timed out - GPS taking too long');
                alert('⚠️ Location Timeout!\n\nGPS is taking too long. Please:\n\n1. Make sure location services are enabled\n2. Go to an area with better GPS signal (outdoors)\n3. Wait a few seconds and try again\n\nPhoto cannot be saved without location.');
                captureBtn.disabled = false;
                captureBtn.textContent = '📸 Capture Photo';
                return;
              } else {
                console.warn('Unknown GPS error:', error);
                alert('⚠️ Could not get location!\n\nPlease enable location services and try again.\n\nPhoto cannot be saved without location.');
                captureBtn.disabled = false;
                captureBtn.textContent = '📸 Capture Photo';
                return;
              }
            }
            
            canvas.toBlob((blob) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const photoData = {
                  id: Date.now(),
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  url: event.target.result,
                  date: new Date().toISOString().split('T')[0],
                  location: locationName,
                  latitude: gpsData ? gpsData.latitude : null,
                  longitude: gpsData ? gpsData.longitude : null,
                  accuracy: gpsData ? gpsData.accuracy : null,
                  gpsTimestamp: gpsData ? gpsData.timestamp : null,
                  agent: userType === 'vendor' ? 'You' : 'Field Agent',
                  status: 'Pending'
                };
                
                const newActivity = {
                  id: Date.now(),
                  title: `Photo for ${campaign.name}`,
                  date: new Date().toISOString().split('T')[0],
                  location: photoData.location,
                  latitude: photoData.latitude,
                  longitude: photoData.longitude,
                  accuracy: photoData.accuracy,
                  photos: 1,
                  campaignId: campaign.id
                };
                
                setActivities(prev => [...prev, newActivity]);
                
                // Stop camera stream
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(modal);
                
                if (gpsData) {
                  alert(`Photo captured successfully!\nLocation: ${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}\nAccuracy: ±${Math.round(gpsData.accuracy)}m`);
                } else {
                  alert('Photo captured successfully!');
                }
              };
              reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.9);
          };
          
          cancelBtn.onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
          };
          
          buttonContainer.appendChild(captureBtn);
          buttonContainer.appendChild(cancelBtn);
          modal.appendChild(video);
          modal.appendChild(locationStatus);
          modal.appendChild(buttonContainer);
          document.body.appendChild(modal);
        })
        .catch((error) => {
          console.error('Camera access denied:', error);
          // Fallback to file input with camera preference
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          
          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              // Get GPS location
              let gpsData = null;
              let locationName = campaign.targetLocations ? campaign.targetLocations.split(',')[0].trim() : 'Unknown';
              
              try {
                gpsData = await getCurrentLocation();
                locationName = `${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}`;
                console.log('GPS data captured:', gpsData);
              } catch (error) {
                console.error('GPS capture failed:', {
                  code: error.code,
                  message: error.message,
                  error: error
                });
                // Continue without GPS
              }
              
              const reader = new FileReader();
              reader.onload = (event) => {
                const photoData = {
                  id: Date.now(),
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  url: event.target.result,
                  date: new Date().toISOString().split('T')[0],
                  location: locationName,
                  latitude: gpsData ? gpsData.latitude : null,
                  longitude: gpsData ? gpsData.longitude : null,
                  accuracy: gpsData ? gpsData.accuracy : null,
                  gpsTimestamp: gpsData ? gpsData.timestamp : null,
                  agent: userType === 'vendor' ? 'You' : 'Field Agent',
                  status: 'Pending'
                };
                
                const newActivity = {
                  id: Date.now(),
                  title: `Photo for ${campaign.name}`,
                  date: new Date().toISOString().split('T')[0],
                  location: photoData.location,
                  latitude: photoData.latitude,
                  longitude: photoData.longitude,
                  accuracy: photoData.accuracy,
                  photos: 1,
                  campaignId: campaign.id
                };
                
                setActivities(prev => [...prev, newActivity]);
                
                if (gpsData) {
                  alert(`Photo uploaded successfully!\nLocation: ${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)}\nAccuracy: ±${Math.round(gpsData.accuracy)}m`);
                } else {
                  alert('Photo uploaded successfully!');
                }
              };
              reader.readAsDataURL(file);
            }
          };
          
          input.click();
        });
    } else {
      // Fallback for browsers without camera API
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const photoData = {
              id: Date.now(),
              campaignId: campaign.id,
              campaignName: campaign.name,
              url: event.target.result,
              date: new Date().toISOString().split('T')[0],
              location: campaign.targetLocations ? campaign.targetLocations.split(',')[0].trim() : 'Unknown',
              agent: userType === 'vendor' ? 'You' : 'Field Agent',
              status: 'Pending'
            };
            
            const newActivity = {
              id: Date.now(),
              title: `Photo for ${campaign.name}`,
              date: new Date().toISOString().split('T')[0],
              location: photoData.location,
              photos: 1,
              campaignId: campaign.id
            };
            
            setActivities(prev => [...prev, newActivity]);
            alert('Photo uploaded successfully!');
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
    }
  };


  // Campaign filtering logic
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !campaignFilters.search || 
      campaign.name.toLowerCase().includes(campaignFilters.search.toLowerCase()) ||
      campaign.clientName.toLowerCase().includes(campaignFilters.search.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(campaignFilters.search.toLowerCase())) ||
      (campaign.targetLocations && campaign.targetLocations.toLowerCase().includes(campaignFilters.search.toLowerCase()));
    
    const matchesType = campaignFilters.campaignType === 'All Types' || 
      campaign.campaignType === campaignFilters.campaignType;
    
    const matchesStatus = campaignFilters.status === 'All Status' ||
      campaign.status === campaignFilters.status;
    
    const matchesClient = campaignFilters.client === 'All Clients' ||
      campaign.clientName === campaignFilters.client;
    
    return matchesSearch && matchesType && matchesStatus && matchesClient;
  });

  const uniqueCampaignTypesForFilter = [...new Set(campaigns.map(c => c.campaignType).filter(Boolean))];
  const uniqueStatusesForFilter = [...new Set(campaigns.map(c => c.status).filter(Boolean))];
  const uniqueClients = [...new Set(campaigns.map(c => c.clientName).filter(Boolean))];

  const renderDashboard = () => (
    <div className="dashboard-main">
      <div className="dashboard-header-section">
        <h1>Dashboard</h1>
        <p>Overview of your BTL campaign activities</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.activeCampaigns}</h3>
            <p>Active Campaigns</p>
            <span className="stat-subtitle">Currently running</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>{stats.totalActivities}</h3>
            <p>Total Activities</p>
            <span className="stat-subtitle">All time submissions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <h3>{stats.photosUploaded}</h3>
            <p>Photos Uploaded</p>
            <span className="stat-subtitle">Geo-tagged evidence</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayActivities}</h3>
            <p>Today's Activities</p>
            <span className="stat-subtitle">Submitted today</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="map-section">
          <h3>Activity Map</h3>
          <div className="map-container">
            <div className="map-placeholder">
              <p>📍 Map View</p>
              <p className="map-credit">Leaflet | © OpenStreetMap contributors</p>
              <div className="map-controls">
                <button className="map-btn">+</button>
                <button className="map-btn">−</button>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-activities">
          <div className="section-header">
            <h3>Recent Activities</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="activities-list">
            {activities.length === 0 ? (
              <div className="empty-state">
                <p>No activities yet</p>
                <button className="btn btn-primary" onClick={() => setActivePage('campaigns')}>
                  Submit First Activity
                </button>
              </div>
            ) : (
              activities.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">📍</div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.title}</p>
                    <p className="activity-meta">{activity.date} • {activity.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {userType === 'vendor' && (
        <div className="campaigns-section">
          <div className="section-header">
            <h3>Active Campaigns</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="campaigns-list">
            {campaigns.length === 0 ? (
              <div className="empty-state">
                <p>No campaigns yet</p>
                <button className="btn btn-primary" onClick={() => setShowCreateCampaign(true)}>
                  Create Campaign
                </button>
              </div>
            ) : (
            <div className="campaigns-grid">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <h4>{campaign.name}</h4>
                  {campaign.campaignType && (
                    <p style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Type: {campaign.campaignType}
                    </p>
                  )}
                  <p>{campaign.description}</p>
                  <div className="campaign-meta">
                    <span>Start: {campaign.startDate}</span>
                    <span>End: {campaign.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'campaigns':
        // Clients can view campaigns but not create them
        if (userType !== 'vendor') {
          return (
            <div className="campaigns-page">
              <div className="page-header">
                <h1>Campaigns</h1>
                <p>View BTL campaign projects</p>
              </div>
              <div className="campaigns-filters">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Search by name, client, description, or location..." 
                    className="search-input"
                    value={campaignFilters.search}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div className="filter-group">
                  <select 
                    className="filter-select"
                    value={campaignFilters.campaignType}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, campaignType: e.target.value }))}
                  >
                    <option>All Types</option>
                    {uniqueCampaignTypesForFilter.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select 
                    className="filter-select"
                    value={campaignFilters.status}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option>All Status</option>
                    {uniqueStatusesForFilter.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select 
                    className="filter-select"
                    value={campaignFilters.client}
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, client: e.target.value }))}
                  >
                    <option>All Clients</option>
                    {uniqueClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="campaigns-page-content">
                {filteredCampaigns.length === 0 ? (
                  <div className="empty-campaigns-state">
                    <div className="empty-icon">📋</div>
                    <h3>{campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}</h3>
                    <p>{campaigns.length === 0 ? 'Campaigns created by vendors will appear here' : 'Try adjusting your filters'}</p>
                  </div>
                ) : (
                  <div className="campaigns-grid">
                    {filteredCampaigns.map((campaign) => (
                      <div key={campaign.id} className="campaign-card">
                        <div className="campaign-header">
                          <h4>{campaign.name}</h4>
                          <span className={`campaign-status ${campaign.status?.toLowerCase()}`}>
                            {campaign.status || 'Active'}
                          </span>
                        </div>
                        <p className="campaign-client">Client: {campaign.clientName}</p>
                        {campaign.campaignType && (
                          <p className="campaign-type">
                            <strong>Type:</strong> {campaign.campaignType}
                          </p>
                        )}
                        {campaign.description && <p className="campaign-description">{campaign.description}</p>}
                        <div className="campaign-meta">
                          <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                          <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                        </div>
                        {campaign.targetLocations && (
                          <div className="campaign-locations">
                            <strong>Locations:</strong> {campaign.targetLocations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="campaigns-page">
            <div className="page-header">
              <h1>Campaigns</h1>
              <p>Manage your BTL campaign projects</p>
            </div>
            <div className="campaigns-page-actions">
              <button className="btn btn-primary" onClick={() => setShowCreateCampaign(true)}>
                New Campaign
              </button>
            </div>
            <div className="campaigns-filters">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search by name, client, description, or location..." 
                  className="search-input"
                  value={campaignFilters.search}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <select 
                  className="filter-select"
                  value={campaignFilters.campaignType}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, campaignType: e.target.value }))}
                >
                  <option>All Types</option>
                  {uniqueCampaignTypesForFilter.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select 
                  className="filter-select"
                  value={campaignFilters.status}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option>All Status</option>
                  {uniqueStatusesForFilter.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select 
                  className="filter-select"
                  value={campaignFilters.client}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, client: e.target.value }))}
                >
                  <option>All Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="campaigns-page-content">
              {filteredCampaigns.length === 0 ? (
                <div className="empty-campaigns-state">
                  <div className="empty-icon">📋</div>
                  <h3>{campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}</h3>
                  <p>{campaigns.length === 0 ? 'Create your first campaign to start tracking field activities' : 'Try adjusting your filters'}</p>
                  {campaigns.length === 0 && (
                    <button className="btn btn-primary" onClick={() => setShowCreateCampaign(true)}>
                      Create Your First Campaign
                    </button>
                  )}
                </div>
              ) : (
                <div className="campaigns-grid">
                  {filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="campaign-card">
                      <div className="campaign-header">
                        <h4>{campaign.name}</h4>
                        <span className={`campaign-status ${campaign.status?.toLowerCase()}`}>
                          {campaign.status || 'Active'}
                        </span>
                      </div>
                      <p className="campaign-client">Client: {campaign.clientName}</p>
                      {campaign.campaignType && (
                        <p className="campaign-type">
                          <strong>Type:</strong> {campaign.campaignType}
                        </p>
                      )}
                      {campaign.description && <p className="campaign-description">{campaign.description}</p>}
                      <div className="campaign-meta">
                        <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                      {campaign.targetLocations && (
                        <div className="campaign-locations">
                          <strong>Locations:</strong> {campaign.targetLocations}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="gallery-page">
            <div className="page-header">
              <h1>Photo Gallery</h1>
              <p>Browse all geo-tagged field activity photos</p>
            </div>
            <div className="gallery-content">
              {campaigns.length === 0 ? (
                <div className="empty-gallery-state">
                  <div className="empty-icon">📸</div>
                  <h3>No campaigns found</h3>
                  <p>{userType === 'vendor' 
                    ? 'Create a campaign to start uploading photos' 
                    : 'No campaigns available yet. Campaigns from vendors will appear here.'}</p>
                </div>
              ) : (
                <div className="campaigns-gallery-grid">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-gallery-card">
                      <div className="campaign-gallery-header">
                        <h3>{campaign.name}</h3>
                        {campaign.status && (
                          <span className={`campaign-status ${campaign.status?.toLowerCase()}`}>
                            {campaign.status}
                          </span>
                        )}
                      </div>
                      {campaign.clientName && (
                        <p className="campaign-client-name">Client: {campaign.clientName}</p>
                      )}
                      {campaign.description && (
                        <p className="campaign-description-text">{campaign.description}</p>
                      )}
                      {campaign.targetLocations && (
                        <p className="campaign-location-text">📍 {campaign.targetLocations}</p>
                      )}
                      <div className="campaign-dates">
                        <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                      <button 
                        className="btn btn-primary take-photo-btn"
                        onClick={() => handleTakePhoto(campaign)}
                      >
                        📸 Take Photo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="reports-page">
            <div className="page-header">
              <h1>Reports</h1>
              <p>Generate and download branded PDF reports</p>
            </div>
            <div className="reports-actions">
              <button className="btn btn-primary">Generate Report</button>
            </div>
            <div className="reports-content">
              <div className="empty-reports-state">
                <div className="empty-icon">📄</div>
                <h3>No reports yet</h3>
                <p>Generate your first report to download branded PDFs with GPS proof</p>
                <button className="btn btn-primary">Generate Your First Report</button>
              </div>
            </div>
            <div className="reports-features">
              <div className="feature-item">
                <h4>Branded PDFs</h4>
                <p>Professional layout with your branding</p>
              </div>
              <div className="feature-item">
                <h4>Daily Summaries</h4>
                <p>Activity breakdown by date</p>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="analytics-page">
            <div className="page-header">
              <h1>Analytics</h1>
            </div>
            <div className="analytics-stats-grid">
              <div className="analytics-stat-card">
                <h3>0</h3>
                <p>Total Activities</p>
                <span>All submissions</span>
              </div>
              <div className="analytics-stat-card">
                <h3>0%</h3>
                <p>Verification Rate</p>
                <span>Approved activities</span>
              </div>
              <div className="analytics-stat-card">
                <h3>0</h3>
                <p>Total Photos</p>
                <span>Geo-tagged evidence</span>
              </div>
              <div className="analytics-stat-card">
                <h3>0</h3>
                <p>Active Campaigns</p>
                <span>0 completed</span>
              </div>
            </div>
            <div className="analytics-content-grid">
              <div className="analytics-section">
                <div className="section-header">
                  <h3>Activity Trends</h3>
                  <select className="filter-select-small">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <div className="section-content">
                  <p className="empty-message">Daily activity submissions over time</p>
                  <div className="empty-chart">
                    <p>No trend data available</p>
                  </div>
                </div>
              </div>
              <div className="analytics-section">
                <div className="section-header">
                  <h3>Status Breakdown</h3>
                </div>
                <div className="section-content">
                  <p className="empty-message">Activity verification status</p>
                  <div className="status-breakdown">
                    <div className="status-item verified">
                      <span className="status-label">Verified</span>
                      <span className="status-count">0</span>
                    </div>
                    <div className="status-item pending">
                      <span className="status-label">Pending</span>
                      <span className="status-count">0</span>
                    </div>
                    <div className="status-item rejected">
                      <span className="status-label">Rejected</span>
                      <span className="status-count">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="analytics-sections-grid">
              <div className="analytics-section">
                <div className="section-header">
                  <h3>Activity Types</h3>
                </div>
                <div className="section-content">
                  <p className="empty-message">Distribution by activity category</p>
                  <div className="empty-chart">
                    <p>No activity data available</p>
                  </div>
                </div>
              </div>
              <div className="analytics-section">
                <div className="section-header">
                  <h3>Location Coverage</h3>
                </div>
                <div className="section-content">
                  <p className="empty-message">Geographic distribution of activities</p>
                  <div className="empty-chart">
                    <p>No location data available</p>
                  </div>
                </div>
              </div>
              <div className="analytics-section">
                <div className="section-header">
                  <h3>Campaign Performance</h3>
                </div>
                <div className="section-content">
                  <p className="empty-message">Detailed metrics for each campaign</p>
                  <div className="empty-chart">
                    <p>No campaign data available</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="whatsapp-sharing">
              <div className="whatsapp-card">
                <div className="whatsapp-icon">💬</div>
                <div className="whatsapp-content">
                  <h3>WhatsApp Sharing</h3>
                  <p>Instant client sharing via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-wrapper">
      {showCreateCampaign && userType === 'vendor' && (
        <CreateCampaign
          onClose={() => setShowCreateCampaign(false)}
          onCreate={handleCreateCampaign}
        />
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>FieldSaathi <span className="brand-lite">Lite</span></h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">Navigation</p>
            <button 
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('dashboard');
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                  const overlay = document.querySelector('.sidebar-overlay');
                  if (overlay) document.body.removeChild(overlay);
                }
              }}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>
            {userType === 'vendor' && (
              <button 
                className={`nav-item ${activePage === 'campaigns' ? 'active' : ''}`}
                onClick={() => setActivePage('campaigns')}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Campaigns</span>
              </button>
            )}
            <button 
              className={`nav-item ${activePage === 'gallery' ? 'active' : ''}`}
              onClick={() => setActivePage('gallery')}
            >
              <span className="nav-icon">📸</span>
              <span className="nav-text">Photo Gallery</span>
            </button>
            <button 
              className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
              onClick={() => setActivePage('reports')}
            >
              <span className="nav-icon">📄</span>
              <span className="nav-text">Reports</span>
            </button>
            <button 
              className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`}
              onClick={() => setActivePage('analytics')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Analytics</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="dashboard-main-area">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button 
              className="toggle-sidebar-btn"
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                // On mobile, add overlay when sidebar opens
                if (window.innerWidth <= 768) {
                  const overlay = document.createElement('div');
                  overlay.className = 'sidebar-overlay';
                  overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    display: ${sidebarOpen ? 'none' : 'block'};
                  `;
                  overlay.onclick = () => {
                    setSidebarOpen(false);
                    document.body.removeChild(overlay);
                  };
                  if (!sidebarOpen && !document.querySelector('.sidebar-overlay')) {
                    document.body.appendChild(overlay);
                  }
                }
              }}
            >
              ☰
            </button>
            <h2 className="page-title">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
          </div>
          <div className="topbar-right">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="user-profile">
              <div className="user-avatar">P</div>
              <div className="user-info">
                <p className="user-email">{userEmail}</p>
                <p className="user-role">{userType === 'client' ? 'Client' : 'Vendor'}</p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-content-area">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
