import { TaxiTierConfig } from '@/types/booking';

export const TAXI_TIERS: TaxiTierConfig[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable aerial travel',
    ratePerKm: 50,
    icon: '✈️'
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced comfort & speed',
    ratePerKm: 80,
    icon: '🚁'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury & fastest route',
    ratePerKm: 120,
    icon: '🛩️'
  }
];

// Bengaluru center coordinates
export const BENGALURU_CENTER = {
  lat: 12.9716,
  lng: 77.5946
};

export const BENGALURU_BOUNDS = {
  north: 13.1739,
  south: 12.7342,
  east: 77.8820,
  west: 77.3745
};

// Calculate distance using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateFare(distance: number, ratePerKm: number): number {
  return Math.round(distance * ratePerKm);
}

export function generateTaxiId(): string {
  const prefix = 'FT';
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${number}`;
}

// Calculate flight duration based on distance (assuming average speed of 120 km/h for flying taxis)
export function calculateFlightDuration(distance: number): number {
  const averageSpeedKmPerHour = 120;
  const durationInHours = distance / averageSpeedKmPerHour;
  const durationInMinutes = Math.round(durationInHours * 60);
  return Math.max(1, durationInMinutes); // Minimum 1 minute
}

// Geocoding function to convert address to coordinates
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Bengaluru&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
