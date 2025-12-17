import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import './CreateCampaign.css';

const CreateCampaign = ({ onClose, onCreate, userType, editingCampaign }) => {
  const [formData, setFormData] = useState({
    name: editingCampaign?.name || '',
    clientName: editingCampaign?.clientName || '',
    campaignType: editingCampaign?.campaignType || '',
    description: editingCampaign?.description || '',
    startDate: editingCampaign?.startDate || '',
    endDate: editingCampaign?.endDate || '',
    targetLocations: editingCampaign?.targetLocations || '',
    status: editingCampaign?.status || 'Active',
    assignedTo: editingCampaign?.assignedTo || '' // For clients to assign to vendor
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.campaignType) newErrors.campaignType = 'Campaign type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onCreate(formData);
      setFormData({
        name: '',
        clientName: '',
        campaignType: '',
        description: '',
        startDate: '',
        endDate: '',
        targetLocations: '',
        status: 'Active',
        assignedTo: ''
      });
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</Typography>
            <Typography variant="body2" color="text.secondary">{editingCampaign ? 'Update campaign details' : 'Set up a new BTL campaign for your client'}</Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>×</Button>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Campaign Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="e.g., Summer Product Launch"
            fullWidth
          />

          <TextField
            label="Client Name *"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            error={!!errors.clientName}
            helperText={errors.clientName}
            placeholder="e.g., ABC Real Estate"
            fullWidth
          />

          <FormControl fullWidth error={!!errors.campaignType}>
            <InputLabel>Campaign Type *</InputLabel>
            <Select
              name="campaignType"
              value={formData.campaignType}
              onChange={handleChange}
              label="Campaign Type *"
            >
              <MenuItem value="">Select campaign type</MenuItem>
              <MenuItem value="Posters">Posters</MenuItem>
              <MenuItem value="Banners">Banners</MenuItem>
              <MenuItem value="Standees">Standees</MenuItem>
              <MenuItem value="Hoardings">Hoardings</MenuItem>
              <MenuItem value="Wall Paintings">Wall Paintings</MenuItem>
              <MenuItem value="Bus Shelters">Bus Shelters</MenuItem>
              <MenuItem value="Pole Kiosks">Pole Kiosks</MenuItem>
              <MenuItem value="Retail Displays">Retail Displays</MenuItem>
              <MenuItem value="Event Branding">Event Branding</MenuItem>
              <MenuItem value="Vehicle Branding">Vehicle Branding</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {errors.campaignType && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.campaignType}</Typography>}
          </FormControl>

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Campaign details..."
            multiline
            rows={4}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date *"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="End Date *"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <TextField
            label="Target Locations"
            name="targetLocations"
            value={formData.targetLocations}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Pune, Nashik"
            fullWidth
          />

          {userType === 'client' && (
            <TextField
              label="Assign to Vendor"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="e.g., vendor@fieldsaathi.com"
              helperText="Enter vendor email to assign this campaign"
              fullWidth
            />
          )}

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</Button>
      </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCampaign;

