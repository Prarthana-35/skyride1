import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface BookingFormProps {
  onSubmit: (name: string, phone: string) => void;
}

export const BookingForm = ({ onSubmit }: BookingFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onSubmit(name, phone);
    }
  };

  return (
    <Card className="p-6 shadow-elevated">
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Details</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Confirm Booking
        </Button>
      </form>
    </Card>
  );
};
