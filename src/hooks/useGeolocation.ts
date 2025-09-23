import { useState, useCallback, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  radius?: number;
  allowedSpecies: string[];
  seasonalRestrictions?: {
    [species: string]: {
      startMonth: number;
      endMonth: number;
    };
  };
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };
          setLocation(locationData);
          setError(null);
          resolve(locationData);
        },
        (error) => {
          const errorMessage = `Geolocation error: ${error.message}`;
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    if (isTracking) return;

    setIsTracking(true);
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
        setError(null);
      },
      (error) => {
        const errorMessage = `Geolocation tracking error: ${error.message}`;
        setError(errorMessage);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );

    setWatchId(id);
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  const isInsideGeofence = useCallback((
    currentLocation: LocationData,
    zone: GeofenceZone
  ): boolean => {
    if (zone.radius) {
      // Circular geofence
      const center = zone.coordinates[0];
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        center.lat,
        center.lng
      );
      return distance <= zone.radius;
    } else {
      // Polygon geofence
      return isPointInPolygon(
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        zone.coordinates
      );
    }
  }, []);

  const validateHarvestLocation = useCallback((
    currentLocation: LocationData,
    species: string,
    zones: GeofenceZone[]
  ): {
    isValid: boolean;
    zone?: GeofenceZone;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    // Find applicable zones
    const validZones = zones.filter(zone => 
      zone.allowedSpecies.includes(species) && 
      isInsideGeofence(currentLocation, zone)
    );

    if (validZones.length === 0) {
      errors.push(`No approved harvesting zone found for ${species} at current location`);
      return { isValid: false, errors };
    }

    // Check seasonal restrictions
    const currentMonth = new Date().getMonth() + 1;
    const zone = validZones[0];
    
    if (zone.seasonalRestrictions && zone.seasonalRestrictions[species]) {
      const restriction = zone.seasonalRestrictions[species];
      const { startMonth, endMonth } = restriction;
      
      let isInSeason: boolean;
      if (startMonth <= endMonth) {
        isInSeason = currentMonth >= startMonth && currentMonth <= endMonth;
      } else {
        // Season crosses year boundary
        isInSeason = currentMonth >= startMonth || currentMonth <= endMonth;
      }
      
      if (!isInSeason) {
        errors.push(`Harvesting ${species} is not allowed in current season`);
      }
    }

    return {
      isValid: errors.length === 0,
      zone: validZones[0],
      errors
    };
  }, [isInsideGeofence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    isTracking,
    error,
    getCurrentLocation,
    startTracking,
    stopTracking,
    isInsideGeofence,
    validateHarvestLocation,
  };
};

// Utility functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}