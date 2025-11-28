import { supabase } from './client';
import { Booking } from '@/types/booking';

export interface BookingInsert {
  id: string;
  user_name: string;
  user_phone: string;
  pickup_location: {
    lat: number;
    lng: number;
    address?: string;
  };
  drop_location: {
    lat: number;
    lng: number;
    address?: string;
  };
  taxi_tier: string;
  distance: number;
  fare: number;
  status: string;
  taxi_id?: string;
  eta?: number;
  timestamp: number;
}

// Save a new booking to the database
export async function saveBooking(booking: Booking): Promise<{ success: boolean; error?: string }> {
  try {
    const bookingData = {
      id: booking.id,
      user_name: booking.userName || '',
      user_phone: booking.userPhone || '',
      pickup_location: booking.startLocation as any,
      drop_location: booking.endLocation as any,
      taxi_tier: booking.tier,
      distance: parseFloat(booking.distance.toString()),
      fare: parseFloat(booking.fare.toString()),
      status: booking.status,
      taxi_id: booking.taxiId || null,
      eta: booking.eta || null,
      timestamp: booking.timestamp,
    };

    const { error } = await supabase
      .from('bookings')
      .insert([bookingData] as any);

    if (error) {
      console.error('Error saving booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception while saving booking:', message);
    return { success: false, error: message };
  }
}

// Fetch all bookings for a user
export async function fetchUserBookings(
  userPhone: string
): Promise<{ bookings: Booking[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_phone', userPhone)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { bookings: [], error: error.message };
    }

    // Transform database records to Booking objects
    const bookings: Booking[] = (data || []).map((record: any) => ({
      id: record.id,
      startLocation: record.pickup_location,
      endLocation: record.drop_location,
      tier: record.taxi_tier,
      distance: record.distance,
      fare: record.fare,
      status: record.status,
      taxiId: record.taxi_id,
      eta: record.eta,
      timestamp: record.timestamp,
      userName: record.user_name,
      userPhone: record.user_phone,
    }));

    return { bookings };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception while fetching bookings:', message);
    return { bookings: [], error: message };
  }
}

// Fetch all bookings (limit to recent ones)
export async function fetchAllBookings(limit: number = 50): Promise<{ bookings: Booking[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all bookings:', error);
      return { bookings: [], error: error.message };
    }

    // Transform database records to Booking objects
    const bookings: Booking[] = (data || []).map((record: any) => ({
      id: record.id,
      startLocation: record.pickup_location,
      endLocation: record.drop_location,
      tier: record.taxi_tier,
      distance: record.distance,
      fare: record.fare,
      status: record.status,
      taxiId: record.taxi_id,
      eta: record.eta,
      timestamp: record.timestamp,
      userName: record.user_name,
      userPhone: record.user_phone,
    }));

    return { bookings };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception while fetching bookings:', message);
    return { bookings: [], error: message };
  }
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception while updating booking:', message);
    return { success: false, error: message };
  }
}
