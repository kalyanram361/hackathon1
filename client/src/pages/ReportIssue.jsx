import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import LocationPicker from "../components/LocationPicker";

function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Waste Management",
    severity: "",
    description: "",
    location: "",
    latitude: null,
    longitude: null
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update character counts
    if (name === 'title') {
      setTitleCount(value.length);
    } else if (name === 'description') {
      setDescriptionCount(value.length);
    }
  };

  // Get user's current location using GPS
  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            location: data.display_name || `${latitude}, ${longitude}`,
            latitude,
            longitude
          }));
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setFormData(prev => ({
            ...prev,
            location: `${latitude}, ${longitude}`,
            latitude,
            longitude
          }));
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let message = 'Unable to get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
          default:
            message += 'An unknown error occurred.';
            break;
        }
        alert(message);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle location selection from map picker
  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      latitude: locationData.lat,
      longitude: locationData.lng
    }));
    setShowLocationPicker(false);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.severity || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('Please login to report an issue');
        return;
      }

      // Decode JWT token to get user_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user_id = payload.id || payload.userId;

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('severity', formData.severity);
      submitData.append('location', formData.location);
      submitData.append('user_id', user_id);
      
      // Add coordinates if available
      if (formData.latitude && formData.longitude) {
        submitData.append('latitude', formData.latitude);
        submitData.append('longitude', formData.longitude);
      }
      
      // Add photos if any
      if (photos.length > 0) {
        submitData.append('image', photos[0]);
      }

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/map', { 
          state: { 
            message: 'Report submitted successfully! Your issue has been added to the map.',
            newReport: result
          }
        });
      } else {
        const error = await response.json();
        if (response.status === 403) {
          alert('Authentication failed. Please login again.');
        } else {
          alert(`Error: ${error.error || 'Failed to submit report'}`);
        }
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      category: "Waste Management",
      severity: "",
      description: "",
      location: "",
      latitude: null,
      longitude: null
    });
    setPhotos([]);
    setTitleCount(0);
    setDescriptionCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <Link to="/" className="inline-block mb-6 px-4 py-2 text-eco-green border border-eco-green rounded-lg hover:bg-eco-green hover:text-white transition-colors">
          Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Report Environmental Issue</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Provide detailed information about the environmental issue you discovered to help relevant authorities respond quickly
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">Issue Title *</span>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue, e.g., 'Overflowing trash bin in park'" 
              maxLength={100}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
              required
            />
            <span className="text-xs text-gray-400 mt-1 block">{titleCount}/100</span>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">Issue Category *</span>
            <select 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent bg-white"
            >
              <option value="Waste Management">Waste Management</option>
              <option value="Water Pollution">Water Pollution</option>
              <option value="Air Quality">Air Quality</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <div className="block">
            <span className="block text-sm font-medium text-gray-700 mb-4">Severity Level *</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${formData.severity === 'Minor' ? 'border-yellow-400 bg-yellow-100' : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'}`}>
                <input 
                  type="radio" 
                  name="severity" 
                  value="Minor" 
                  checked={formData.severity === 'Minor'}
                  onChange={handleInputChange}
                  className="sr-only" 
                />
                <div>
                  <div className="font-semibold text-yellow-700">Minor</div>
                  <div className="text-sm text-yellow-600">Low impact</div>
                </div>
              </label>
              <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${formData.severity === 'Moderate' ? 'border-orange-400 bg-orange-100' : 'border-orange-200 bg-orange-50 hover:border-orange-300'}`}>
                <input 
                  type="radio" 
                  name="severity" 
                  value="Moderate" 
                  checked={formData.severity === 'Moderate'}
                  onChange={handleInputChange}
                  className="sr-only" 
                />
                <div>
                  <div className="font-semibold text-orange-700">Moderate</div>
                  <div className="text-sm text-orange-600">Needs attention</div>
                </div>
              </label>
              <label className={`border-2 p-4 rounded-lg cursor-pointer transition-colors ${formData.severity === 'Severe' ? 'border-red-400 bg-red-100' : 'border-red-200 bg-red-50 hover:border-red-300'}`}>
                <input 
                  type="radio" 
                  name="severity" 
                  value="Severe" 
                  checked={formData.severity === 'Severe'}
                  onChange={handleInputChange}
                  className="sr-only" 
                />
                <div>
                  <div className="font-semibold text-red-700">Severe</div>
                  <div className="text-sm text-red-600">Urgent action needed</div>
                </div>
              </label>
            </div>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</span>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about the issue, including specific conditions, time of occurrence, impact area, etc..." 
              maxLength={500}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent resize-vertical"
              required
            />
            <span className="text-xs text-gray-400 mt-1 block">{descriptionCount}/500</span>
          </label>

          {/* Enhanced Location Section */}
          <div className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">Location Information *</span>
            
            {/* Location Input */}
            <div className="relative mb-3">
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter specific address or use location picker below"
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="20" height="20" fill="#2ecc40" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </span>
            </div>

            {/* Location Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className={`flex-1 flex items-center justify-center px-4 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors ${
                  gettingLocation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="mr-2">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
                {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="flex-1 flex items-center justify-center px-4 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="mr-2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Pick on Map
              </button>
            </div>

            {/* Show coordinates if available */}
            {formData.latitude && formData.longitude && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                📍 Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>
            )}
            
            <span className="text-xs text-gray-500 mt-1 block">GPS positioning is recommended for precise location</span>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">Related Photos</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <svg width="32" height="32" fill="#b2b2b2" viewBox="0 0 24 24" className="mx-auto mb-4">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-3l2.5-3.01L17 17H7l3-4z"/>
                </svg>
                <div className="font-semibold text-gray-700 mb-1">Upload Issue Photos</div>
                <div className="text-gray-600 mb-1">Drag photos here or click to select files</div>
                <div className="text-xs text-gray-500">Supports JPG, PNG formats, maximum 5 photos</div>
              </label>
            </div>
            {photos.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {photos.length} photo(s) selected
              </div>
            )}
          </label>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-eco-green text-white hover:bg-green-600'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={formData.latitude && formData.longitude ? 
            { lat: formData.latitude, lng: formData.longitude } : null
          }
        />
      )}
    </div>
  );
}

export default ReportIssue;