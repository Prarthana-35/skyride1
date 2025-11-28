import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types/booking';
import { BENGALURU_CENTER } from '@/lib/taxi-config';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  startLocation?: Location;
  endLocation?: Location;
  onStartLocationSelect?: (location: Location) => void;
  onEndLocationSelect?: (location: Location) => void;
  isSelectingStart?: boolean;
  isSelectingEnd?: boolean;
  taxiLocation?: Location;
  showRoute?: boolean;
}

export const MapView = ({
  startLocation,
  endLocation,
  onStartLocationSelect,
  onEndLocationSelect,
  isSelectingStart,
  isSelectingEnd,
  taxiLocation,
  showRoute
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const taxiMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [BENGALURU_CENTER.lat, BENGALURU_CENTER.lng],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle map clicks
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const location: Location = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };

      if (isSelectingStart && onStartLocationSelect) {
        onStartLocationSelect(location);
      } else if (isSelectingEnd && onEndLocationSelect) {
        onEndLocationSelect(location);
      }
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [isSelectingStart, isSelectingEnd, onStartLocationSelect, onEndLocationSelect]);

  // Update start marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (startMarkerRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
    }

    if (startLocation) {
      const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      startMarkerRef.current = L.marker([startLocation.lat, startLocation.lng], {
        icon: greenIcon
      }).addTo(mapRef.current)
        .bindPopup('Start Location');
    }
  }, [startLocation]);

  // Update end marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (endMarkerRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
    }

    if (endLocation) {
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      endMarkerRef.current = L.marker([endLocation.lat, endLocation.lng], {
        icon: redIcon
      }).addTo(mapRef.current)
        .bindPopup('Destination');
    }
  }, [endLocation]);

  // Update taxi marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (taxiMarkerRef.current) {
      mapRef.current.removeLayer(taxiMarkerRef.current);
    }

    if (taxiLocation) {
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      taxiMarkerRef.current = L.marker([taxiLocation.lat, taxiLocation.lng], {
        icon: blueIcon
      }).addTo(mapRef.current)
        .bindPopup('Your Flying Taxi');
    }
  }, [taxiLocation]);

  // Draw route
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
    }

    if (showRoute && startLocation && endLocation) {
      routeLineRef.current = L.polyline(
        [[startLocation.lat, startLocation.lng], [endLocation.lat, endLocation.lng]],
        { color: 'hsl(199, 89%, 48%)', weight: 3, opacity: 0.7, dashArray: '10, 10' }
      ).addTo(mapRef.current);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [showRoute, startLocation, endLocation]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg shadow-elevated"
      style={{ minHeight: '400px' }}
    />
  );
};
