import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Tabs,
  Tab,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  PhotoCamera as PhotoIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import './Dashboard.css';
import CreateCampaign from './CreateCampaign';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
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
        const parsedCampaigns = JSON.parse(savedCampaigns);
        setCampaigns(parsedCampaigns);
        console.log('Campaigns loaded:', parsedCampaigns.length, parsedCampaigns);
      } catch (e) {
        console.error('Error loading campaigns:', e);
      }
    } else {
      console.log('No campaigns found in localStorage');
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

  // Calculate total photos from all campaigns
  const totalPhotos = campaigns.reduce((sum, campaign) => {
    if (campaign.activities && campaign.activities.length > 0) {
      return sum + campaign.activities.filter(act => act.photoUrl).length;
    }
    return sum;
  }, 0);

  const stats = {
    activeCampaigns: campaigns.length,
    totalActivities: activities.length,
    photosUploaded: totalPhotos,
    todayActivities: activities.filter(act => {
      const today = new Date().toDateString();
      return new Date(act.date).toDateString() === today;
    }).length
  };

  const handleCreateCampaign = (campaignData) => {
    if (editingCampaign) {
      // Update existing campaign
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === editingCampaign.id) {
          return {
            ...c,
            ...campaignData,
            // Preserve activities and submission status
            activities: c.activities || [],
            submitted: c.submitted || false,
            submittedAt: c.submittedAt || null
          };
        }
        return c;
      });
      setCampaigns(updatedCampaigns);
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      setEditingCampaign(null);
      setShowCreateCampaign(false);
      alert('Campaign updated successfully!');
    } else {
      // Create new campaign
      const newCampaign = { 
        ...campaignData, 
        id: Date.now(), 
        createdAt: new Date().toISOString(),
        submitted: false,
        submittedAt: null,
        activities: [],
        createdBy: userType === 'client' ? userEmail : null,
        assignedTo: campaignData.assignedTo || (userType === 'vendor' ? userEmail : null)
      };
      const updatedCampaigns = [...campaigns, newCampaign];
      setCampaigns(updatedCampaigns);
      setShowCreateCampaign(false);
      
      // Save campaigns to localStorage immediately
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      console.log('Campaign created and saved:', newCampaign);
      console.log('Total campaigns:', updatedCampaigns.length);
    }
  };

  const handleEditCampaign = (campaign) => {
    console.log('handleEditCampaign called with:', campaign);
    setEditingCampaign(campaign);
    setShowCreateCampaign(true);
  };

  const handleDeleteCampaign = (campaignId) => {
    console.log('handleDeleteCampaign called with campaignId:', campaignId);
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      setCampaigns(updatedCampaigns);
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      alert('Campaign deleted successfully!');
    }
  };

  // Generate random location for testing/demo purposes
  const getRandomLocation = () => {
    // Random locations in India (for demo)
    const locations = [
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Add small random offset to make it more realistic (±0.01 degrees ≈ 1km)
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    
    return {
      latitude: randomLocation.lat + latOffset,
      longitude: randomLocation.lng + lngOffset,
      accuracy: Math.floor(Math.random() * 50) + 5, // Random accuracy 5-55 meters
      locationName: randomLocation.name,
      timestamp: new Date().toISOString()
    };
  };

  const handleTakePhoto = (campaign) => {
    // No location permission needed - using random locations for demo

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

          // Location status indicator (using random locations)
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
          locationStatus.innerHTML = '📍 Random location will be assigned';
          
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
            
            // Generate random location (no GPS needed)
            const locationData = getRandomLocation();
            const locationName = `${locationData.locationName} (${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)})`;
            console.log('Random location generated:', locationData);
            
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
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  accuracy: locationData.accuracy,
                  gpsTimestamp: locationData.timestamp,
                  agent: userType === 'vendor' ? 'You' : 'Field Agent',
                  status: 'Pending'
                };
                
                const newActivity = {
                  id: Date.now(),
                  title: `Photo for ${campaign.name}`,
                  date: new Date().toISOString().split('T')[0],
                  location: photoData.location,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  accuracy: locationData.accuracy,
                  photos: 1,
                  campaignId: campaign.id,
                  photoUrl: photoData.url,
                  submittedBy: userEmail
                };
                
                // Add activity to campaign
                const updatedCampaigns = campaigns.map(c => {
                  if (c.id === campaign.id) {
                    return {
                      ...c,
                      activities: [...(c.activities || []), newActivity]
                    };
                  }
                  return c;
                });
                setCampaigns(updatedCampaigns);
                localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
                
                setActivities(prev => [...prev, newActivity]);
                
                // Stop camera stream
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(modal);
                
                alert(`Photo captured successfully!\nLocation: ${locationData.locationName}\nCoordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}\nAccuracy: ±${locationData.accuracy}m`);
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
              // Generate random location
              const locationData = getRandomLocation();
              const locationName = `${locationData.locationName} (${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)})`;
              console.log('Random location generated:', locationData);
              
              const reader = new FileReader();
              reader.onload = (event) => {
                const photoData = {
                  id: Date.now(),
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  url: event.target.result,
                  date: new Date().toISOString().split('T')[0],
                  location: locationName,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  accuracy: locationData.accuracy,
                  gpsTimestamp: locationData.timestamp,
                  agent: userType === 'vendor' ? 'You' : 'Field Agent',
                  status: 'Pending'
                };
                
                const newActivity = {
                  id: Date.now(),
                  title: `Photo for ${campaign.name}`,
                  date: new Date().toISOString().split('T')[0],
                  location: photoData.location,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  accuracy: locationData.accuracy,
                  photos: 1,
                  campaignId: campaign.id,
                  photoUrl: photoData.url,
                  submittedBy: userEmail
                };
                
                // Add activity to campaign
                const updatedCampaigns = campaigns.map(c => {
                  if (c.id === campaign.id) {
                    return {
                      ...c,
                      activities: [...(c.activities || []), newActivity]
                    };
                  }
                  return c;
                });
                setCampaigns(updatedCampaigns);
                localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
                
                setActivities(prev => [...prev, newActivity]);
                
                alert(`Photo uploaded successfully!\nLocation: ${locationData.locationName}\nCoordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}\nAccuracy: ±${locationData.accuracy}m`);
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
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          // Generate random location
          const locationData = getRandomLocation();
          const locationName = `${locationData.locationName} (${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)})`;
          
          const reader = new FileReader();
          reader.onload = (event) => {
            const photoData = {
              id: Date.now(),
              campaignId: campaign.id,
              campaignName: campaign.name,
              url: event.target.result,
              date: new Date().toISOString().split('T')[0],
              location: locationName,
              agent: userType === 'vendor' ? 'You' : 'Field Agent',
              status: 'Pending'
            };
            
            const newActivity = {
              id: Date.now(),
              title: `Photo for ${campaign.name}`,
              date: new Date().toISOString().split('T')[0],
              location: locationName,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              photos: 1,
              campaignId: campaign.id,
              photoUrl: photoData.url,
              submittedBy: userEmail
            };
            
            // Add activity to campaign
            const updatedCampaigns = campaigns.map(c => {
              if (c.id === campaign.id) {
                return {
                  ...c,
                  activities: [...(c.activities || []), newActivity]
                };
              }
              return c;
            });
            setCampaigns(updatedCampaigns);
            localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
            
            setActivities(prev => [...prev, newActivity]);
            alert(`Photo uploaded successfully!\nLocation: ${locationData.locationName}`);
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
    }
  };

  const handleSubmitCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    // Check if campaign has photos/activities
    if (!campaign.activities || campaign.activities.length === 0) {
      alert('Cannot submit campaign without photos. Please add at least one photo before submitting.');
      return;
    }
    
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          submitted: true,
          submittedAt: new Date().toISOString(),
          status: 'Completed'
        };
      }
      return c;
    });
    
    setCampaigns(updatedCampaigns);
    localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
    alert('Campaign submitted successfully! The client can now view all activities and photos.');
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
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        {userType === 'client' ? 'Client Dashboard' : 'Vendor Dashboard'}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Overview of your BTL campaign activities
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Card 
          sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'auto' },
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => setActivePage('campaigns')}
        >
          <CardContent sx={{ p: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.75rem', mb: 1, lineHeight: 1.2 }}>
                {stats.activeCampaigns}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                Active Campaigns
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Currently running
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'auto' },
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => setActivePage('campaigns')}
        >
          <CardContent sx={{ p: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.75rem', mb: 1, lineHeight: 1.2 }}>
                {stats.totalActivities}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                Total Activities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                All time submissions
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'auto' },
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => setActivePage('gallery')}
        >
          <CardContent sx={{ p: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.75rem', mb: 1, lineHeight: 1.2 }}>
                {stats.photosUploaded}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                Photos Uploaded
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {stats.photosUploaded === 1 ? 'Photo' : 'Photos'} from all campaigns
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card 
          sx={{ 
            flex: 1, 
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'auto' },
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}
          onClick={() => setActivePage('campaigns')}
        >
          <CardContent sx={{ p: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.75rem', mb: 1, lineHeight: 1.2 }}>
                {stats.todayActivities}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                Today's Activities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Submitted today
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {userType === 'vendor' && (
        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Activity Map</Typography>
              </Box>
              <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C6.5%2C97.4%2C37.1&layer=mapnik&marker=20.5937%2C78.9629"
                  title="Activity Map"
                  loading="lazy"
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activities</Typography>
                <Button size="small">View All</Button>
              </Box>
              {activities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>No activities yet</Typography>
                  <Button variant="contained" onClick={() => setActivePage('campaigns')} sx={{ mt: 2 }}>
                    Submit First Activity
                  </Button>
                </Box>
              ) : (
                <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {activities.slice(0, 5).map((activity, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemIcon>📍</ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.date} • ${activity.location}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {userType === 'vendor' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Active Campaigns</Typography>
              <Button size="small">View All</Button>
            </Box>
            {campaigns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>No campaigns yet</Typography>
                <Button variant="contained" onClick={() => setShowCreateCampaign(true)} sx={{ mt: 2 }}>
                  Create Campaign
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {campaigns.map((campaign) => (
                  <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{campaign.name}</Typography>
                        {campaign.campaignType && (
                          <Chip label={campaign.campaignType} size="small" color="primary" sx={{ mb: 1 }} />
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {campaign.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Start: {campaign.startDate} • End: {campaign.endDate}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'campaigns':
        // Clients can view campaigns
        if (userType === 'client') {
          return (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Campaigns</Typography>
                  <Typography variant="body2" color="text.secondary">View your BTL campaign projects</Typography>
                </Box>
              </Box>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search campaigns..."
                  value={campaignFilters.search}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, search: e.target.value }))}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={campaignFilters.campaignType}
                    label="Type"
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, campaignType: e.target.value }))}
                  >
                    <MenuItem value="All Types">All Types</MenuItem>
                    {uniqueCampaignTypesForFilter.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={campaignFilters.status}
                    label="Status"
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="All Status">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {filteredCampaigns.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>📋</Typography>
                    <Typography variant="h6" gutterBottom>
                      {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {campaigns.length === 0 ? 'No campaigns have been created yet' : 'Try adjusting your filters'}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {filteredCampaigns.map((campaign) => (
                    <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6">{campaign.name}</Typography>
                            <Chip 
                              label={campaign.submitted ? 'Submitted' : (campaign.status || 'Active')} 
                              size="small"
                              color={campaign.submitted ? 'success' : 'primary'}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Client: {campaign.clientName}
                          </Typography>
                          {campaign.campaignType && (
                            <Chip label={campaign.campaignType} size="small" sx={{ mb: 1 }} />
                          )}
                          {campaign.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {campaign.description}
                            </Typography>
                          )}
                          {campaign.assignedTo && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              Assigned to: {campaign.assignedTo}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Start: {new Date(campaign.startDate).toLocaleDateString()} • End: {new Date(campaign.endDate).toLocaleDateString()}
                          </Typography>
                          {campaign.targetLocations && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                              📍 {campaign.targetLocations}
                            </Typography>
                          )}
                          {campaign.submitted && userType === 'client' && (
                            <Button 
                              variant="contained" 
                              fullWidth
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setActivePage('campaign-details');
                              }}
                              sx={{ mt: 1 }}
                            >
                              View Details & Activities ({campaign.activities?.length || 0})
                            </Button>
                          )}
                          {!campaign.submitted && (
                            <Chip 
                              label="⏳ Waiting for vendor submission" 
                              size="small" 
                              sx={{ mt: 1, bgcolor: '#fff3e0', color: '#f57c00' }}
                            />
                          )}
                          <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push content to top */}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          );
        }
        // Vendors can create and view campaigns
        if (userType === 'vendor') {
          return (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Campaigns</Typography>
                  <Typography variant="body2" color="text.secondary">Manage your BTL campaign projects</Typography>
                </Box>
                <Button variant="contained" onClick={() => setShowCreateCampaign(true)}>
                  New Campaign
                </Button>
              </Box>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search campaigns..."
                  value={campaignFilters.search}
                  onChange={(e) => setCampaignFilters(prev => ({ ...prev, search: e.target.value }))}
                  size="small"
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={campaignFilters.campaignType}
                    label="Type"
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, campaignType: e.target.value }))}
                  >
                    <MenuItem value="All Types">All Types</MenuItem>
                    {uniqueCampaignTypesForFilter.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={campaignFilters.status}
                    label="Status"
                    onChange={(e) => setCampaignFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="All Status">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {filteredCampaigns.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h3" sx={{ mb: 2 }}>📋</Typography>
                    <Typography variant="h6" gutterBottom>
                      {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {campaigns.length === 0 ? 'Create your first campaign to start tracking field activities' : 'Try adjusting your filters'}
                    </Typography>
                    {campaigns.length === 0 && (
                      <Button variant="contained" onClick={() => setShowCreateCampaign(true)}>
                        Create Your First Campaign
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {filteredCampaigns.map((campaign) => (
                    <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6">{campaign.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              {userType === 'vendor' && (
                                <>
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Edit clicked:', campaign);
                                      if (campaign.submitted) {
                                        alert('Cannot edit submitted campaign');
                                        return;
                                      }
                                      handleEditCampaign(campaign);
                                    }}
                                    disabled={campaign.submitted}
                                    sx={{ 
                                      p: 0.75,
                                      color: '#000000 !important',
                                      '&:hover:not(:disabled)': { 
                                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                                        color: '#000000 !important'
                                      },
                                      '&.Mui-disabled': { 
                                        opacity: 0.3,
                                        color: '#9e9e9e !important'
                                      }
                                    }}
                                    title={campaign.submitted ? "Cannot edit submitted campaign" : "Edit Campaign"}
                                  >
                                    <EditIcon sx={{ fontSize: '20px' }} />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Delete clicked:', campaign.id);
                                      handleDeleteCampaign(campaign.id);
                                    }}
                                    sx={{ 
                                      p: 0.75,
                                      color: '#000000 !important',
                                      '&:hover': { 
                                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                                        color: '#d32f2f !important'
                                      }
                                    }}
                                    title="Delete Campaign"
                                  >
                                    <DeleteIcon sx={{ fontSize: '20px' }} />
                                  </IconButton>
                                </>
                              )}
                              <Chip 
                                label={campaign.submitted ? 'Submitted' : (campaign.status || 'Active')} 
                                size="small"
                                color={campaign.submitted ? 'success' : 'primary'}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Client: {campaign.clientName}
                          </Typography>
                          {campaign.campaignType && (
                            <Chip label={campaign.campaignType} size="small" sx={{ mb: 1 }} />
                          )}
                          {campaign.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {campaign.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Start: {new Date(campaign.startDate).toLocaleDateString()} • End: {new Date(campaign.endDate).toLocaleDateString()}
                          </Typography>
                          {campaign.targetLocations && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                              📍 {campaign.targetLocations}
                            </Typography>
                          )}
                          <Button 
                            variant="contained" 
                            fullWidth
                            onClick={() => handleTakePhoto(campaign)}
                            sx={{ mt: 1, mb: 0.5 }}
                          >
                            📸 Take Photo
                          </Button>
                          {!campaign.submitted && (
                            <Button 
                              variant="outlined" 
                              fullWidth
                              disabled={!campaign.activities || campaign.activities.length === 0}
                              onClick={() => {
                                if (!campaign.activities || campaign.activities.length === 0) {
                                  alert('Please add at least one photo before submitting the campaign.');
                                  return;
                                }
                                if (window.confirm('Submit this campaign to client? All activities and photos will be visible to client.')) {
                                  handleSubmitCampaign(campaign.id);
                                }
                              }}
                              sx={{ mt: 1 }}
                            >
                              ✅ Submit Campaign {campaign.activities && campaign.activities.length > 0 && `(${campaign.activities.length} photos)`}
                            </Button>
                          )}
                          {!campaign.submitted && (!campaign.activities || campaign.activities.length === 0) && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                              Add photos to submit campaign
                            </Typography>
                          )}
                          {campaign.submitted && (
                            <Chip 
                              label="✅ Submitted to Client" 
                              size="small" 
                              color="success"
                              sx={{ mt: 1, width: '100%', justifyContent: 'center' }}
                            />
                          )}
                          <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push content to top */}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
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
        // Collect all photos from all campaigns
        const allPhotos = [];
        campaigns.forEach(campaign => {
          // Filter campaigns based on user type
          let shouldInclude = false;
          if (userType === 'vendor') {
            shouldInclude = campaign.assignedTo === userEmail || campaign.createdBy === userEmail;
          } else if (userType === 'client') {
            shouldInclude = campaign.createdBy === userEmail || campaign.submitted;
          } else {
            shouldInclude = true;
          }
          
          if (shouldInclude && campaign.activities && campaign.activities.length > 0) {
            campaign.activities.forEach(activity => {
              if (activity.photoUrl) {
                allPhotos.push({
                  ...activity,
                  campaignName: campaign.name,
                  campaignId: campaign.id,
                  clientName: campaign.clientName
                });
              }
            });
          }
        });

        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Photo Gallery
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Browse all geo-tagged field activity photos ({allPhotos.length} photos)
            </Typography>

            {allPhotos.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>📸</Typography>
                  <Typography variant="h6" gutterBottom>
                    No photos found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {userType === 'vendor' 
                      ? 'Start taking photos in your campaigns to see them here' 
                      : 'No photos have been submitted yet. Photos from vendors will appear here.'}
                  </Typography>
                  {userType === 'vendor' && (
                    <Button variant="contained" onClick={() => setActivePage('campaigns')}>
                      Go to Campaigns
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {allPhotos.map((photo, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={photo.id || idx}>
                    <Card>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 250,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.95);
                            z-index: 10000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 2rem;
                          `;
                          const img = document.createElement('img');
                          img.src = photo.photoUrl;
                          img.style.cssText = 'max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px;';
                          const closeBtn = document.createElement('button');
                          closeBtn.textContent = '×';
                          closeBtn.style.cssText = `
                            position: absolute;
                            top: 20px;
                            right: 20px;
                            background: rgba(255, 255, 255, 0.9);
                            border: none;
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            font-size: 2rem;
                            cursor: pointer;
                            color: #000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          `;
                          closeBtn.onclick = () => document.body.removeChild(modal);
                          modal.appendChild(img);
                          modal.appendChild(closeBtn);
                          document.body.appendChild(modal);
                        }}
                      >
                        <img
                          src={photo.photoUrl}
                          alt={photo.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {photo.campaignName}
                        </Typography>
                        {photo.title && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {photo.title}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📍 {photo.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Date: {photo.date}
                        </Typography>
                        {photo.latitude && photo.longitude && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            GPS: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                          </Typography>
                        )}
                        {photo.submittedBy && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            By: {photo.submittedBy}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
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
      case 'campaign-details':
        if (!selectedCampaign) {
          return (
            <Box>
              <Button onClick={() => setActivePage('campaigns')} sx={{ mb: 2 }}>← Back to Campaigns</Button>
              <Typography variant="h6" color="error">Campaign not found</Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Button onClick={() => setActivePage('campaigns')} sx={{ mb: 3 }}>← Back to Campaigns</Button>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              {selectedCampaign.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Client: {selectedCampaign.clientName} • Submitted: {selectedCampaign.submittedAt ? new Date(selectedCampaign.submittedAt).toLocaleDateString() : 'N/A'}
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Campaign Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Campaign Type</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{selectedCampaign.campaignType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={selectedCampaign.status || 'Active'} color="primary" size="small" sx={{ mt: 0.5 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{new Date(selectedCampaign.startDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{new Date(selectedCampaign.endDate).toLocaleDateString()}</Typography>
                  </Grid>
                  {selectedCampaign.targetLocations && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Target Locations</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>📍 {selectedCampaign.targetLocations}</Typography>
                    </Grid>
                  )}
                  {selectedCampaign.description && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{selectedCampaign.description}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Activities & Photos ({selectedCampaign.activities?.length || 0})
            </Typography>

            {!selectedCampaign.activities || selectedCampaign.activities.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No activities submitted yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The vendor has not submitted any photos or activities for this campaign.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {selectedCampaign.activities.map((activity, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={activity.id || idx}>
                    <Card>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 200,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.95);
                            z-index: 10000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 2rem;
                          `;
                          const img = document.createElement('img');
                          img.src = activity.photoUrl;
                          img.style.cssText = 'max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px;';
                          const closeBtn = document.createElement('button');
                          closeBtn.textContent = '×';
                          closeBtn.style.cssText = `
                            position: absolute;
                            top: 20px;
                            right: 20px;
                            background: rgba(255, 255, 255, 0.9);
                            border: none;
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            font-size: 2rem;
                            cursor: pointer;
                            color: #000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          `;
                          closeBtn.onclick = () => document.body.removeChild(modal);
                          modal.appendChild(img);
                          modal.appendChild(closeBtn);
                          document.body.appendChild(modal);
                        }}
                      >
                        <img
                          src={activity.photoUrl}
                          alt={activity.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📍 {activity.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Date: {activity.date}
                        </Typography>
                        {activity.latitude && activity.longitude && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            GPS: {activity.latitude.toFixed(6)}, {activity.longitude.toFixed(6)}
                          </Typography>
                        )}
                        {activity.submittedBy && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Submitted by: {activity.submittedBy}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
      default:
        return renderDashboard();
    }
  };

  const handleNavClick = (page) => {
    setActivePage(page);
  };

  // Navigation items based on user type
  const navItems = [
    { value: 'dashboard', label: userType === 'client' ? 'Client Dashboard' : 'Vendor Dashboard', icon: <DashboardIcon /> },
    ...(userType === 'client' ? [{ value: 'campaigns', label: 'Campaigns', icon: <CampaignIcon /> }] : []),
    ...(userType === 'vendor' ? [{ value: 'campaigns', label: 'Campaigns', icon: <CampaignIcon /> }] : []),
    { value: 'gallery', label: 'Photo Gallery', icon: <PhotoIcon /> },
    { value: 'reports', label: 'Reports', icon: <ReportsIcon /> },
    { value: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showCreateCampaign && (
        <CreateCampaign
          onClose={() => {
            setShowCreateCampaign(false);
            setEditingCampaign(null);
          }}
          onCreate={handleCreateCampaign}
          userType={userType}
          editingCampaign={editingCampaign}
        />
      )}
      
      {/* Header */}
      <AppBar position="sticky" sx={{ zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            FieldSaathi <span style={{ fontWeight: 300 }}>Lite</span>
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 36, height: 36 }}>
              {userEmail.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                {userEmail}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {userType === 'client' ? 'Client' : 'Vendor'}
              </Typography>
            </Box>
          </Box>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ textTransform: 'none' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Paper elevation={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activePage}
          onChange={(e, newValue) => setActivePage(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 64,
              fontWeight: 500,
            },
          }}
        >
          {navItems.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              icon={item.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 128px)',
        }}
      >
        <Container maxWidth="xl">
          {renderPage()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
