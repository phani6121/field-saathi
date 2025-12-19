import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer,
  Snackbar,
  Alert,
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
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import './Dashboard.css';
import CreateCampaign from './CreateCampaign';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [coordinateSearch, setCoordinateSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchedCoordinate, setSearchedCoordinate] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const userType = localStorage.getItem('userType') || 'client';
  const userEmail = localStorage.getItem('userEmail') || 'phanindra61214243@gmail.com';
  const basePath = userType === 'client' ? '/client-dashboard' : '/vendor-dashboard';

  // Get current page from URL
  const getPageFromPath = (pathname) => {
    if (pathname.match(/\/campaigns\/[^/]+$/)) return 'campaign-details';
    if (pathname.includes('/campaigns')) return 'campaigns';
    if (pathname.includes('/gallery')) return 'gallery';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/analytics')) return 'analytics';
    return 'dashboard-overview';
  };

  // Get campaign ID from URL if on campaign-details page
  const getCampaignIdFromPath = (pathname) => {
    const match = pathname.match(/\/campaigns\/([^/]+)$/);
    return match ? match[1] : null;
  };

  // Sync activePage with URL and load campaign if on campaign-details
  useEffect(() => {
    const page = getPageFromPath(location.pathname);
    setActivePage(page);
    
    // If on campaign-details page, load the campaign
    if (page === 'campaign-details') {
      const campaignId = getCampaignIdFromPath(location.pathname);
      if (campaignId) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (campaign) {
          setSelectedCampaign(campaign);
        }
      }
    }
  }, [location.pathname, campaigns]);

  // Redirect to appropriate dashboard based on user type and URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // If accessing /dashboard, redirect to appropriate dashboard
    if (currentPath === '/dashboard' || currentPath.startsWith('/dashboard/')) {
      const subPath = currentPath.replace('/dashboard', '');
      navigate(basePath + subPath, { replace: true });
    }
    // If accessing wrong dashboard, redirect to correct one
    else if ((currentPath.startsWith('/client-dashboard') && userType !== 'client') || 
             (currentPath.startsWith('/vendor-dashboard') && userType !== 'vendor')) {
      const subPath = currentPath.replace(/^\/(client|vendor)-dashboard/, '');
      navigate(basePath + subPath, { replace: true });
    }
    // If on base dashboard path without sub-path, ensure we're on the right base
    else if (currentPath === basePath) {
      // Already on correct base path
    }
  }, [location.pathname, userType, navigate, basePath]);

  // Check authentication when accessing dashboard
  // This handles forward navigation from sign-in page
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    
    // If no user is logged in, redirect to sign-in
    if (!userType) {
      navigate('/signin', { replace: true });
      return;
    }
    
    // If user type doesn't match the dashboard they're trying to access, redirect
    const currentPath = location.pathname;
    if ((currentPath.startsWith('/client-dashboard') && userType !== 'client') ||
        (currentPath.startsWith('/vendor-dashboard') && userType !== 'vendor')) {
      const correctPath = userType === 'client' ? '/client-dashboard' : '/vendor-dashboard';
      navigate(correctPath, { replace: true });
    }
  }, [location.pathname, navigate]);

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
    navigate('/');
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

  const handleCopyCoordinates = (coordinates) => {
    navigator.clipboard.writeText(coordinates).then(() => {
      showNotification('GPS coordinates copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy coordinates:', err);
      showNotification('Failed to copy coordinates', 'error');
    });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Get all GPS coordinates from campaigns for map display
  const getAllCampaignCoordinates = () => {
    const allCoordinates = [];
    campaigns.forEach(campaign => {
      if (campaign.activities && campaign.activities.length > 0) {
        campaign.activities.forEach(activity => {
          if (activity.latitude && activity.longitude) {
            // Avoid duplicates
            const exists = allCoordinates.some(
              coord => coord.lat === activity.latitude && coord.lng === activity.longitude
            );
            if (!exists) {
              allCoordinates.push({
                lat: activity.latitude,
                lng: activity.longitude,
                campaignName: campaign.name,
                activityTitle: activity.title || 'Activity'
              });
            }
          }
        });
      }
    });
    return allCoordinates;
  };

  // Parse coordinate search input
  const parseCoordinates = (input) => {
    if (!input || !input.trim()) return null;
    
    // Remove whitespace
    const cleaned = input.trim();
    
    // Try different formats: "lat, lng", "lat,lng", "lat lng"
    const patterns = [
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/, // lat, lng
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/, // lat lng
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate latitude (-90 to 90)
        if (lat < -90 || lat > 90) {
          setSearchError('Latitude must be between -90 and 90');
          return null;
        }
        
        // Validate longitude (-180 to 180)
        if (lng < -180 || lng > 180) {
          setSearchError('Longitude must be between -180 and 180');
          return null;
        }
        
        setSearchError('');
        return { lat, lng };
      }
    }
    
    setSearchError('Invalid format. Use: lat, lng (e.g., 19.0760, 72.8777)');
    return null;
  };

  // Generate OpenStreetMap URL with markers
  const generateMapUrl = (coordinates, searchCoord = null) => {
    // If searching by coordinates, show that location
    if (searchCoord) {
      const padding = 0.01; // Small padding around searched location
      const bbox = `${searchCoord.lng - padding}%2C${searchCoord.lat - padding}%2C${searchCoord.lng + padding}%2C${searchCoord.lat + padding}`;
      const marker = `${searchCoord.lat}%2C${searchCoord.lng}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
    }

    if (coordinates.length === 0) {
      // Default to India center if no coordinates
      return 'https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C6.5%2C97.4%2C37.1&layer=mapnik&marker=20.5937%2C78.9629';
    }

    // Calculate center point
    const avgLat = coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;

    // Calculate bounding box with padding
    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const padding = Math.max(latRange, lngRange, 0.05) * 0.3; // 30% padding
    
    const minLat = Math.min(...lats) - padding;
    const maxLat = Math.max(...lats) + padding;
    const minLng = Math.min(...lngs) - padding;
    const maxLng = Math.max(...lngs) + padding;
    
    const bbox = `${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}`;

    // For multiple markers, we'll use the center and show all in the bbox
    // OpenStreetMap embed supports one marker, so we center on average
    const marker = `${avgLat}%2C${avgLng}`;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  };

  const handleCoordinateSearch = () => {
    if (!coordinateSearch.trim()) {
      setSearchError('');
      setSearchedCoordinate(null);
      return;
    }
    
    const coord = parseCoordinates(coordinateSearch);
    if (coord) {
      setSearchedCoordinate(coord);
    }
  };

  const handleClearSearch = () => {
    setCoordinateSearch('');
    setSearchError('');
    setSearchedCoordinate(null);
  };

  const handlePasteCoordinates = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCoordinateSearch(text.trim());
      setSearchError('');
      // Auto-search after pasting
      const coord = parseCoordinates(text.trim());
      if (coord) {
        setSearchedCoordinate(coord);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Failed to paste from clipboard. Please paste manually.');
    }
  };

  // Get current GPS location from device
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            locationName: `Location (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`,
            timestamp: new Date().toISOString()
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Location access denied. ';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage += 'Please enable location services in your browser settings and try again.';
            showNotification('Location access denied. Please enable location services to capture photos with GPS coordinates.', 'error');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage += 'Location information is unavailable.';
            showNotification('Location information is unavailable. Please check your device settings.', 'error');
          } else if (error.code === error.TIMEOUT) {
            errorMessage += 'Location request timed out.';
            showNotification('Location request timed out. Please try again.', 'error');
          } else {
            errorMessage += 'An unknown error occurred.';
            showNotification('Failed to get location. Please enable location services.', 'error');
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const handleTakePhoto = async (campaign) => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser. Please use a modern browser.', 'error');
      return;
    }

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

          // Location status indicator
          const locationStatus = document.createElement('div');
          locationStatus.style.cssText = `
            color: #ff9800;
            font-size: 0.85rem;
            margin-bottom: 1rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          `;
          locationStatus.innerHTML = '📍 Getting GPS location...';
          
          // Get location when camera opens
          let locationData = null;
          getCurrentLocation()
            .then((loc) => {
              locationData = loc;
              locationStatus.innerHTML = `📍 Location: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
              locationStatus.style.color = '#4caf50';
            })
            .catch((error) => {
              locationStatus.innerHTML = '⚠️ Location access denied. Enable location to capture GPS coordinates.';
              locationStatus.style.color = '#f44336';
            });
          
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
            
            // Get current location if not already obtained
            let currentLocation = locationData;
            if (!currentLocation) {
              try {
                currentLocation = await getCurrentLocation();
              } catch (error) {
                showNotification('Cannot capture photo without location. Please enable location services.', 'error');
                return;
              }
            }
            
            const locationName = `${currentLocation.locationName} (${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)})`;
            console.log('GPS location obtained:', currentLocation);
            
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
                
                showNotification(`Photo captured successfully! Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`, 'success');
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
              // Get current GPS location
              try {
                const locationData = await getCurrentLocation();
                const locationName = `${locationData.locationName} (${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)})`;
                console.log('GPS location obtained:', locationData);
              
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
                  
                  showNotification(`Photo uploaded successfully! Location: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`, 'success');
                };
                reader.readAsDataURL(file);
              } catch (error) {
                showNotification('Cannot upload photo without location. Please enable location services.', 'error');
              }
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
          // Get current GPS location
          try {
            const locationData = await getCurrentLocation();
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
              
              showNotification(`Photo uploaded successfully! Location: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`, 'success');
            };
            reader.readAsDataURL(file);
          } catch (error) {
            showNotification('Cannot upload photo without location. Please enable location services.', 'error');
          }
        }
      };
      
      input.click();
    }
  };

  const handleSubmitCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    // Check if campaign has photos/activities
    if (!campaign.activities || campaign.activities.length === 0) {
      showNotification('Cannot submit campaign without photos. Please add at least one photo before submitting.', 'warning');
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
    showNotification('Campaign submitted successfully! The client can now view all activities and photos.', 'success');
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
          onClick={() => navigate(`${basePath}/campaigns`)}
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
          onClick={() => navigate(`${basePath}/campaigns`)}
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
          onClick={() => navigate(`${basePath}/gallery`)}
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
          onClick={() => navigate(`${basePath}/campaigns`)}
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

    </Box>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard-overview':
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
                          {campaign.submitted && userType === 'client' && (
                            <Button 
                              variant="contained" 
                              fullWidth
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                navigate(`${basePath}/campaigns/${campaign.id}`);
                              }}
                              sx={{ mt: 1 }}
                            >
                              View Details & Activities ({campaign.activities?.length || 0})
                            </Button>
                          )}
                          {!campaign.submitted && (
                            <Chip 
                              label="⏳ Waiting for agency submission" 
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
                          {!campaign.submitted && (
                            <Button 
                              variant="contained" 
                              fullWidth
                              onClick={() => handleTakePhoto(campaign)}
                              sx={{ mt: 1, mb: 0.5 }}
                            >
                              📸 Take Photo
                            </Button>
                          )}
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
                      : 'No photos have been submitted yet. Photos from agencies will appear here.'}
                  </Typography>
                  {userType === 'vendor' && (
                    <Button variant="contained" onClick={() => navigate(`${basePath}/campaigns`)}>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              color="primary" 
                              display="block" 
                              sx={{ 
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                '&:hover': {
                                  color: 'primary.dark'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const coord = { lat: photo.latitude, lng: photo.longitude };
                                setSearchedCoordinate(coord);
                                setCoordinateSearch(`${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`);
                                // Scroll to map after a short delay to ensure state update
                                setTimeout(() => {
                                  const mapElement = document.getElementById('photo-locations-map');
                                  if (mapElement) {
                                    mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                            >
                              GPS: {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoordinates(`${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`);
                              }}
                              sx={{ 
                                p: 0.5,
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: 'action.hover'
                                }
                              }}
                              title="Copy coordinates"
                            >
                              <CopyIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          </Box>
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

            {/* Map Section - Full Width */}
            {(() => {
              const allCoordinates = getAllCampaignCoordinates();
              const mapUrl = generateMapUrl(allCoordinates, searchedCoordinate);
              
              return (
                <Card id="photo-locations-map" sx={{ mt: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Photo Locations Map</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <TextField
                          size="small"
                          placeholder="Search by coordinates (e.g., 19.0760, 72.8777)"
                          value={coordinateSearch}
                          onChange={(e) => {
                            setCoordinateSearch(e.target.value);
                            setSearchError('');
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCoordinateSearch();
                            }
                          }}
                          onPaste={(e) => {
                            // Handle paste event
                            setTimeout(() => {
                              const pastedText = e.clipboardData.getData('text');
                              const coord = parseCoordinates(pastedText);
                              if (coord) {
                                setSearchedCoordinate(coord);
                              }
                            }, 0);
                          }}
                          error={!!searchError}
                          helperText={searchError || 'Enter lat, lng to search'}
                          sx={{ minWidth: 280 }}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                size="small"
                                onClick={handlePasteCoordinates}
                                sx={{ 
                                  mr: -1,
                                  '&:hover': {
                                    bgcolor: 'transparent'
                                  }
                                }}
                                title="Paste coordinates from clipboard"
                              >
                                <PasteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              </IconButton>
                            )
                          }}
                        />
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={handleCoordinateSearch}
                          sx={{ height: '40px' }}
                        >
                          Search
                        </Button>
                        {searchedCoordinate && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ height: '40px' }}
                          >
                            Clear
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ height: 500, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={mapUrl}
                        title="Photo Locations Map"
                        loading="lazy"
                        key={searchedCoordinate ? `${searchedCoordinate.lat}-${searchedCoordinate.lng}` : 'all-locations'}
                      />
                      {searchedCoordinate && (
                        <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 2, maxWidth: '300px' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Searched Location
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.8rem' }}>
                            📍 {searchedCoordinate.lat.toFixed(6)}, {searchedCoordinate.lng.toFixed(6)}
                          </Typography>
                        </Box>
                      )}
                      {!searchedCoordinate && allCoordinates.length === 0 && (
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No GPS coordinates available. Add activities with photos to see locations on the map.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}
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
              <Button onClick={() => navigate(`${basePath}/campaigns`)} sx={{ mb: 2 }}>← Back to Campaigns</Button>
              <Typography variant="h6" color="error">Campaign not found</Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Button onClick={() => navigate(`${basePath}/campaigns`)} sx={{ mb: 3 }}>← Back to Campaigns</Button>
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
                    The agency has not submitted any photos or activities for this campaign.
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <Typography 
                              variant="caption" 
                              color="primary" 
                              display="block" 
                              sx={{ 
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                '&:hover': {
                                  color: 'primary.dark'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const coord = { lat: activity.latitude, lng: activity.longitude };
                                setSearchedCoordinate(coord);
                                setCoordinateSearch(`${activity.latitude.toFixed(6)}, ${activity.longitude.toFixed(6)}`);
                                // Scroll to map after a short delay to ensure state update
                                setTimeout(() => {
                                  const mapElement = document.getElementById('campaign-details-map');
                                  if (mapElement) {
                                    mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                            >
                              GPS: {activity.latitude.toFixed(6)}, {activity.longitude.toFixed(6)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoordinates(`${activity.latitude.toFixed(6)}, ${activity.longitude.toFixed(6)}`);
                              }}
                              sx={{ 
                                p: 0.5,
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: 'action.hover'
                                }
                              }}
                              title="Copy coordinates"
                            >
                              <CopyIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          </Box>
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

            {/* Map Section - Campaign Details */}
            {(() => {
              // Get all coordinates from this campaign's activities
              const campaignCoordinates = selectedCampaign.activities
                ? selectedCampaign.activities
                    .filter(act => act.latitude && act.longitude)
                    .map(act => ({
                      lat: act.latitude,
                      lng: act.longitude,
                      title: act.title || 'Activity Location'
                    }))
                : [];
              
              // Use searched coordinate if available, otherwise show all campaign coordinates
              const mapUrl = generateMapUrl(campaignCoordinates, searchedCoordinate);
              
              return (
                <Card id="campaign-details-map" sx={{ mt: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Campaign Locations Map</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <TextField
                          size="small"
                          placeholder="Search by coordinates (e.g., 19.0760, 72.8777)"
                          value={coordinateSearch}
                          onChange={(e) => {
                            setCoordinateSearch(e.target.value);
                            setSearchError('');
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCoordinateSearch();
                            }
                          }}
                          onPaste={(e) => {
                            setTimeout(() => {
                              const pastedText = e.clipboardData.getData('text');
                              const coord = parseCoordinates(pastedText);
                              if (coord) {
                                setSearchedCoordinate(coord);
                              }
                            }, 0);
                          }}
                          error={!!searchError}
                          helperText={searchError || 'Enter lat, lng to search'}
                          sx={{ minWidth: 280 }}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                size="small"
                                onClick={handlePasteCoordinates}
                                sx={{ 
                                  mr: -1,
                                  '&:hover': {
                                    bgcolor: 'transparent'
                                  }
                                }}
                                title="Paste coordinates from clipboard"
                              >
                                <PasteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              </IconButton>
                            )
                          }}
                        />
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={handleCoordinateSearch}
                          sx={{ height: '40px' }}
                        >
                          Search
                        </Button>
                        {searchedCoordinate && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ height: '40px' }}
                          >
                            Clear
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ height: 500, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={mapUrl}
                        title="Campaign Locations Map"
                        loading="lazy"
                        key={searchedCoordinate ? `${searchedCoordinate.lat}-${searchedCoordinate.lng}` : 'all-locations'}
                      />
                      {searchedCoordinate && (
                        <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 2, maxWidth: '300px' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Searched Location
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.8rem' }}>
                            📍 {searchedCoordinate.lat.toFixed(6)}, {searchedCoordinate.lng.toFixed(6)}
                          </Typography>
                        </Box>
                      )}
                      {!searchedCoordinate && campaignCoordinates.length === 0 && (
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No GPS coordinates available. Activities with photos will show locations on the map.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}
          </Box>
        );
      default:
        return renderDashboard();
    }
  };

  const handleNavClick = (page) => {
    const path = page === 'dashboard' ? basePath : `${basePath}/${page}`;
    navigate(path);
  };

  // Navigation items based on user type
  const navItems = [
    { value: 'dashboard-overview', label: 'Dashboard', icon: <DashboardIcon /> },
    ...(userType === 'client' ? [{ value: 'campaigns', label: 'Campaigns', icon: <CampaignIcon /> }] : []),
    ...(userType === 'vendor' ? [{ value: 'campaigns', label: 'Campaigns', icon: <CampaignIcon /> }] : []),
    ...(userType === 'vendor' ? [{ value: 'gallery', label: 'Photo Gallery', icon: <PhotoIcon /> }] : []),
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
      <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ mr: { xs: 1, sm: 2 }, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {userType === 'client' ? 'Client' : 'Agency'}
          </Typography>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit" 
            sx={{ mr: { xs: 0.5, sm: 1 } }}
            size="small"
          >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mr: { xs: 1, sm: 2 } }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}>
              {userEmail.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                {userEmail}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {userType === 'client' ? 'Client' : 'Agency'}
              </Typography>
            </Box>
          </Box>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<LogoutIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />} 
            sx={{ 
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              minWidth: { xs: 'auto', sm: 'auto' },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, sm: 1 }
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Logout</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Out</Box>
          </Button>
        </Toolbar>
      </AppBar>

      {/* Side Menu and Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: { xs: 260, sm: 280 },
              maxWidth: '85vw',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Box sx={{ pt: 2.5, pb: 1.5, px: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                px: 1.5,
                mb: 0.5,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Menu
            </Typography>
          </Box>
          <List sx={{ px: 1.5, pt: 0.5 }}>
            {navItems.map((item) => (
              <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activePage === item.value}
                  onClick={() => {
                    const path = (item.value === 'dashboard-overview') ? basePath : `${basePath}/${item.value}`;
                    navigate(path);
                    setMobileDrawerOpen(false); // Close drawer on mobile after navigation
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    mb: 0.5,
                    minHeight: 48, // Better touch target for mobile
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateX(4px)',
                      },
                      '&:active': {
                        transform: 'scale(0.98)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: { xs: 40, sm: 44 },
                      color: activePage === item.value ? 'white' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: activePage === item.value ? 600 : 500,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Desktop Side Menu */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            },
          }}
        >
          <Box sx={{ pt: 3, pb: 2, px: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                px: 2,
                mb: 1
              }}
            >
              Menu
            </Typography>
          </Box>
          <List sx={{ px: 2, pt: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activePage === item.value}
                  onClick={() => {
                    const path = (item.value === 'dashboard-overview') ? basePath : `${basePath}/${item.value}`;
                    navigate(path);
                  }}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateX(4px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 44,
                      color: activePage === item.value ? 'white' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: activePage === item.value ? 600 : 500,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: 'background.default',
            overflow: 'auto',
            minHeight: 'calc(100vh - 64px)',
            width: { xs: '100%', sm: 'calc(100% - 280px)' },
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 3 } }}>
            {renderPage()}
          </Container>
        </Box>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
