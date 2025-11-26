export const geocodeLocation = async (locationString) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const geocodeMultipleLocations = async (reports) => {
  const geocodedReports = [];
  
  for (const report of reports) {
    if (report.latitude && report.longitude) {
      // Already has coordinates
      geocodedReports.push({
        ...report,
        lat: report.latitude,
        lng: report.longitude
      });
    } else if (report.location) {
      // Need to geocode
      const coords = await geocodeLocation(report.location);
      geocodedReports.push({
        ...report,
        lat: coords?.lat || 51.505, // Default to London if geocoding fails
        lng: coords?.lng || -0.09
      });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return geocodedReports;
};