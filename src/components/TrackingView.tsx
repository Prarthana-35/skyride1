import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapView } from './MapView';
import { Location, Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, MapPin } from 'lucide-react';

interface TrackingViewProps {
  booking: Booking;
}

export const TrackingView = ({ booking }: TrackingViewProps) => {
  const navigate = useNavigate();
  const [taxiLocation, setTaxiLocation] = useState<Location>({
    lat: booking.startLocation.lat - 0.02,
    lng: booking.startLocation.lng - 0.02
  });
  const [eta, setEta] = useState(booking.eta || 5);

  useEffect(() => {
    // Simulate taxi movement
    const interval = setInterval(() => {
      setTaxiLocation(prev => {
        const newLat = prev.lat + (booking.startLocation.lat - prev.lat) * 0.1;
        const newLng = prev.lng + (booking.startLocation.lng - prev.lng) * 0.1;
        
        // Check if taxi has reached start location
        const distance = Math.sqrt(
          Math.pow(newLat - booking.startLocation.lat, 2) + 
          Math.pow(newLng - booking.startLocation.lng, 2)
        );
        
        if (distance < 0.001) {
          clearInterval(interval);
          setTimeout(() => {
            // Complete the booking
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            const updatedBookings = bookings.map((b: Booking) =>
              b.id === booking.id ? { ...b, status: 'completed' } : b
            );
            localStorage.setItem('bookings', JSON.stringify(updatedBookings));
            navigate('/history');
          }, 2000);
        }
        
        return { lat: newLat, lng: newLng };
      });
      
      setEta(prev => Math.max(0, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [booking, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="p-6 shadow-float animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Flying Taxi En Route
                </h2>
                <p className="text-muted-foreground">Taxi ID: {booking.taxiId}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/history')}>
              View History
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">ETA</p>
                <p className="font-semibold text-foreground">{eta} min</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-semibold text-foreground">{booking.distance.toFixed(1)} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm text-muted-foreground">Fare</p>
                <p className="font-semibold text-foreground">₹{booking.fare}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="h-[500px] rounded-lg overflow-hidden shadow-float">
          <MapView
            startLocation={booking.startLocation}
            endLocation={booking.endLocation}
            taxiLocation={taxiLocation}
            showRoute={true}
          />
        </div>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            Your flying taxi is approaching. Please be ready at the pickup location.
          </p>
        </Card>
      </div>
    </div>
  );
};
