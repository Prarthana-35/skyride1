import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { TierSelector } from '@/components/TierSelector';
import { BookingForm } from '@/components/BookingForm';
import { TrackingView } from '@/components/TrackingView';
import { LocationSearch } from '@/components/LocationSearch';
import { SafetyInfoDialog } from '@/components/SafetyInfoDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Location, TaxiTier, Booking } from '@/types/booking';
import { calculateDistance, calculateFare, calculateFlightDuration, generateTaxiId, TAXI_TIERS } from '@/lib/taxi-config';
import { saveBooking } from '@/integrations/supabase/bookings';
import { MapPin, Navigation, History, Plane } from 'lucide-react';
import { toast } from 'sonner';

type BookingStep = 'location' | 'tier' | 'details' | 'tracking';

const Index = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>('location');
  const [startLocation, setStartLocation] = useState<Location | undefined>();
  const [endLocation, setEndLocation] = useState<Location | undefined>();
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TaxiTier>('standard');
  const [currentBooking, setCurrentBooking] = useState<Booking | undefined>();

  const distance = startLocation && endLocation
    ? calculateDistance(startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng)
    : 0;

  const flightDuration = distance > 0 ? calculateFlightDuration(distance) : 0;

  const handleStartLocationSelect = (location: Location) => {
    setStartLocation(location);
    setIsSelectingStart(false);
    toast.success('Pickup location set! Now select your destination.');
  };

  const handleStartLocationSearch = (lat: number, lng: number, address?: string) => {
    handleStartLocationSelect({ lat, lng, address });
  };

  const handleEndLocationSelect = (location: Location) => {
    setEndLocation(location);
    toast.success('Destination set! Choose your taxi tier.');
  };

  const handleEndLocationSearch = (lat: number, lng: number, address?: string) => {
    handleEndLocationSelect({ lat, lng, address });
  };

  const handleContinueToTier = () => {
    if (!startLocation || !endLocation) {
      toast.error('Please select both pickup and destination points');
      return;
    }
    setStep('tier');
  };

  const handleContinueToDetails = () => {
    setStep('details');
  };

  const handleBookingSubmit = async (name: string, phone: string) => {
    if (!startLocation || !endLocation) return;

    const tierConfig = TAXI_TIERS.find(t => t.id === selectedTier)!;
    const fare = calculateFare(distance, tierConfig.ratePerKm);
    const taxiId = generateTaxiId();

    const booking: Booking = {
      id: `BK${Date.now()}`,
      startLocation,
      endLocation,
      tier: selectedTier,
      distance,
      fare,
      status: 'assigned',
      taxiId,
      eta: Math.ceil(distance * 2), // Rough ETA in minutes
      timestamp: Date.now(),
      userName: name,
      userPhone: phone
    };

    // Save to localStorage (backup)
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Save to Supabase database
    const { success, error } = await saveBooking(booking);
    if (!success) {
      console.error('Failed to save booking to database:', error);
      toast.error('Booking saved locally but failed to sync. Check your connection.');
    }

    setCurrentBooking(booking);
    setStep('tracking');
    toast.success('Booking confirmed! Your flying taxi is on the way!');
  };

  const resetBooking = () => {
    setStep('location');
    setStartLocation(undefined);
    setEndLocation(undefined);
    setIsSelectingStart(true);
    setSelectedTier('standard');
    setCurrentBooking(undefined);
  };

  if (step === 'tracking' && currentBooking) {
    return <TrackingView booking={currentBooking} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SkyRide</h1>
              <p className="text-sm text-muted-foreground">Flying Taxi Bengaluru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SafetyInfoDialog />
            <Button variant="outline" onClick={() => navigate('/history')}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <Card className="p-4 shadow-elevated">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {step === 'location' && 'Select Locations'}
                  {step === 'tier' && 'Route Preview'}
                  {step === 'details' && 'Confirm Journey'}
                </h2>
                {step !== 'location' && (
                  <Button variant="outline" size="sm" onClick={resetBooking}>
                    Reset
                  </Button>
                )}
              </div>

              {step === 'location' && (
                <div className="space-y-3 mb-4">
                  <LocationSearch
                    label="Search Pickup Location"
                    placeholder="e.g., Indiranagar, MG Road..."
                    onLocationSelect={handleStartLocationSearch}
                  />
                  <div className="text-center text-sm text-muted-foreground py-1">or click on map</div>
                  <Button
                    variant={isSelectingStart ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setIsSelectingStart(true)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {startLocation ? 'Pickup Location Set ✓' : 'Click Map for Pickup'}
                  </Button>
                  
                  <LocationSearch
                    label="Search Destination"
                    placeholder="e.g., Whitefield, Koramangala..."
                    onLocationSelect={handleEndLocationSearch}
                  />
                  <div className="text-center text-sm text-muted-foreground py-1">or click on map</div>
                  <Button
                    variant={!isSelectingStart && !endLocation ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setIsSelectingStart(false)}
                    disabled={!startLocation}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {endLocation ? 'Destination Set ✓' : 'Click Map for Destination'}
                  </Button>
                </div>
              )}

              <div className="h-[400px] rounded-lg overflow-hidden">
                <MapView
                  startLocation={startLocation}
                  endLocation={endLocation}
                  onStartLocationSelect={handleStartLocationSelect}
                  onEndLocationSelect={handleEndLocationSelect}
                  isSelectingStart={isSelectingStart}
                  isSelectingEnd={!isSelectingStart && !!startLocation}
                  showRoute={step !== 'location'}
                />
              </div>

              {step === 'location' && startLocation && endLocation && (
                <div className="mt-4 p-4 bg-accent rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Distance</span>
                    <span className="font-semibold text-foreground">{distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. Flight Time</span>
                    <span className="font-semibold text-foreground">{flightDuration} min</span>
                  </div>
                  <div className="border-t border-border mt-3 pt-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Fare Estimates</h4>
                    <div className="space-y-1">
                      {TAXI_TIERS.map(tier => (
                        <div key={tier.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{tier.name}</span>
                          <span className="font-semibold text-foreground">
                            ₹{calculateFare(distance, tier.ratePerKm)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-2" onClick={handleContinueToTier}>
                    Continue to Select Tier
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Details Section */}
          <div className="space-y-4">
            {step === 'tier' && (
              <>
                <TierSelector
                  selectedTier={selectedTier}
                  onTierSelect={setSelectedTier}
                  distance={distance}
                  flightDuration={flightDuration}
                />
                <Button className="w-full" size="lg" onClick={handleContinueToDetails}>
                  Continue to Booking
                </Button>
              </>
            )}

            {step === 'details' && (
              <>
                <Card className="p-6 shadow-elevated">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Journey Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-semibold text-foreground">{distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier</span>
                      <span className="font-semibold text-foreground">
                        {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Fare</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{calculateFare(distance, TAXI_TIERS.find(t => t.id === selectedTier)!.ratePerKm)}
                      </span>
                    </div>
                  </div>
                </Card>
                <BookingForm onSubmit={handleBookingSubmit} />
              </>
            )}

            {step === 'location' && (
              <Card className="p-6 shadow-elevated">
                <h3 className="text-lg font-semibold text-foreground mb-4">How it works</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Select Locations</p>
                      <p className="text-sm text-muted-foreground">Pick your start and destination on the map</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Choose Tier</p>
                      <p className="text-sm text-muted-foreground">Select from Economy, Standard, or Premium</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Confirm & Fly</p>
                      <p className="text-sm text-muted-foreground">Track your flying taxi in real-time</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
