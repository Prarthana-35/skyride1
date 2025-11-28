import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/booking';
import { fetchAllBookings } from '@/integrations/supabase/bookings';
import { ArrowLeft, MapPin, Calendar, CreditCard, Loader } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      
      // Try to fetch from database
      const { bookings: dbBookings, error: dbError } = await fetchAllBookings(50);
      
      if (dbError) {
        console.warn('Failed to fetch from database, using localStorage:', dbError);
        // Fallback to localStorage
        const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const sortedBookings = savedBookings.sort((a: Booking, b: Booking) => b.timestamp - a.timestamp);
        setBookings(sortedBookings.slice(0, 10));
      } else {
        setBookings(dbBookings.slice(0, 10));
      }
      
      setLoading(false);
    };

    loadBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Booking History</h1>
        </div>

        {loading ? (
          <Card className="p-12 text-center shadow-elevated">
            <div className="flex justify-center mb-4">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading your bookings...</p>
          </Card>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center shadow-elevated">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No bookings yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start your first aerial journey today!
            </p>
            <Button onClick={() => navigate('/')}>Book Now</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6 shadow-elevated hover:shadow-float transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="font-medium text-foreground">
                          {booking.startLocation.address || `${booking.startLocation.lat.toFixed(4)}, ${booking.startLocation.lng.toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium text-foreground">
                          {booking.endLocation.address || `${booking.endLocation.lat.toFixed(4)}, ${booking.endLocation.lng.toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(booking.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-bold text-primary">₹{booking.fare}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Distance: {booking.distance.toFixed(1)} km</span>
                      <span>Tier: {booking.tier.charAt(0).toUpperCase() + booking.tier.slice(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {booking.userName && <span>Passenger: {booking.userName}</span>}
                      {booking.taxiId && <span>Taxi: {booking.taxiId}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
