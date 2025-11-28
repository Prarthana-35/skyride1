export type TaxiTier = 'economy' | 'standard' | 'premium';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Booking {
  id: string;
  startLocation: Location;
  endLocation: Location;
  tier: TaxiTier;
  distance: number;
  fare: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  taxiId?: string;
  eta?: number;
  timestamp: number;
  userName?: string;
  userPhone?: string;
}

export interface TaxiTierConfig {
  id: TaxiTier;
  name: string;
  description: string;
  ratePerKm: number;
  icon: string;
}
