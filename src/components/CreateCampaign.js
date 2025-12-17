import React, { useState } from 'react';
import './CreateCampaign.css';

const CreateCampaign = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    campaignType: '',
    description: '',
    startDate: '',
    endDate: '',
    targetLocations: '',
    status: 'Active'
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
        status: 'Active'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Create Your First Campaign</h2>
        <p className="modal-subtitle">Set up a new BTL campaign for your client</p>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <form className="campaign-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="e.g., Summer Product Launch"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="clientName">Client Name *</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className={errors.clientName ? 'error' : ''}
            placeholder="e.g., ABC Real Estate"
          />
          {errors.clientName && <span className="error-message">{errors.clientName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="campaignType">Campaign Type *</label>
          <select
            id="campaignType"
            name="campaignType"
            value={formData.campaignType}
            onChange={handleChange}
            className={errors.campaignType ? 'error' : ''}
          >
            <option value="">Select campaign type</option>
            <option value="Posters">Posters</option>
            <option value="Banners">Banners</option>
            <option value="Standees">Standees</option>
            <option value="Hoardings">Hoardings</option>
            <option value="Wall Paintings">Wall Paintings</option>
            <option value="Bus Shelters">Bus Shelters</option>
            <option value="Pole Kiosks">Pole Kiosks</option>
            <option value="Retail Displays">Retail Displays</option>
            <option value="Event Branding">Event Branding</option>
            <option value="Vehicle Branding">Vehicle Branding</option>
            <option value="Other">Other</option>
          </select>
          {errors.campaignType && <span className="error-message">{errors.campaignType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Campaign details..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={errors.startDate ? 'error' : ''}
              placeholder="mm/dd/yyyy"
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={errors.endDate ? 'error' : ''}
              placeholder="mm/dd/yyyy"
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="targetLocations">Target Locations</label>
          <input
            type="text"
            id="targetLocations"
            name="targetLocations"
            value={formData.targetLocations}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Pune, Nashik"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create Campaign</button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CreateCampaign;

