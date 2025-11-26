import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function LocationPicker({ onLocationSelect, onClose, initialLocation }) {
  const [position, setPosition] = useState(initialLocation || { lat: 51.505, lng: -0.09 });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Reverse geocode when position changes
  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position]);

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      setAddress(data.display_name || `${lat}, ${lng}`);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAddress(`${lat}, ${lng}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelect({
      lat: position.lat,
      lng: position.lng,
      address: address
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>

          {/* Instructions overlay */}
          <div className="absolute top-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-1000">
            <p className="text-sm text-gray-600">
              📍 Click anywhere on the map to select location
            </p>
          </div>
        </div>

        {/* Address display and actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Address:
            </label>
            <div className="bg-white p-3 border border-gray-300 rounded-lg">
              {loading ? (
                <div className="flex items-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  Getting address...
                </div>
              ) : (
                <p className="text-gray-800">{address}</p>
              )}
            </div>
          </div>

          {position && (
            <div className="mb-3 text-xs text-gray-500">
              Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading || !position}
              className="flex-1 bg-eco-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Location
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;