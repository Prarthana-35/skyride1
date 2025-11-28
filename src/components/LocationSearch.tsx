import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { geocodeAddress } from '@/lib/taxi-config';
import { toast } from 'sonner';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  placeholder: string;
  label: string;
}

export function LocationSearch({ onLocationSelect, placeholder, label }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsSearching(true);
    const result = await geocodeAddress(searchQuery);
    setIsSearching(false);

    if (result) {
      onLocationSelect(result.lat, result.lng, result.displayName);
      toast.success(`${label} set: ${result.displayName}`);
      setSearchQuery('');
    } else {
      toast.error('Location not found. Please try a different search term.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {label}
        </label>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
        />
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={isSearching}
        size="default"
      >
        {isSearching ? (
          <>Searching...</>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Search
          </>
        )}
      </Button>
    </div>
  );
}
