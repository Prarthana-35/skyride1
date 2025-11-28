import { TaxiTier } from '@/types/booking';
import { TAXI_TIERS, calculateFare } from '@/lib/taxi-config';
import { Card } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';

interface TierSelectorProps {
  selectedTier: TaxiTier;
  onTierSelect: (tier: TaxiTier) => void;
  distance: number;
  flightDuration: number;
}

export const TierSelector = ({ selectedTier, onTierSelect, distance, flightDuration }: TierSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Taxi Tier</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{flightDuration} min flight</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TAXI_TIERS.map((tier) => {
          const fare = calculateFare(distance, tier.ratePerKm);
          const isSelected = selectedTier === tier.id;

          return (
            <Card
              key={tier.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-float ${
                isSelected 
                  ? 'border-primary border-2 bg-accent' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onTierSelect(tier.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl">{tier.icon}</div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{tier.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">₹{fare}</span>
                <span className="text-sm text-muted-foreground">
                  (₹{tier.ratePerKm}/km)
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
