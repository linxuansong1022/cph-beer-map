"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { BeerSpot } from "../types/place";

// Helper function to create icons with different colors
const createIcon = (colorUrl: string) => {
  return L.icon({
    iconUrl: colorUrl,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Define icons for different categories
const breweryIcon = createIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png");
const barIcon = createIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png");
const shopIcon = createIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png");

// Function to choose the right icon based on place data
const getMarkerIcon = (place: BeerSpot) => {
  // If the place has a logo, use it as a custom marker
  if (place.logoUrl) {
    return L.divIcon({
      className: '', // Empty class to avoid default styles interfering too much if we fully style inner div
      html: `<div class="w-12 h-12 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden relative flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
               <img src="${place.logoUrl}" class="w-full h-full object-cover" alt="${place.name}" />
             </div>`,
      iconSize: [48, 48], // Size of the icon
      iconAnchor: [24, 24], // Center the anchor (half of size)
      popupAnchor: [0, -28] // Popup appears above
    });
  }

  // Fallback to colored pins
  switch (place.category) {
    case 'brewery':
      return breweryIcon;
    case 'bar':
      return barIcon;
    case 'shop':
      return shopIcon;
    default:
      return barIcon;
  }
};

// Helper component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Helper component to programmatically move the map
function MapUpdater({ position }: { position: [number, number] | null }) {
  const map = useMapEvents({}); // Get access to the map instance

  if (position) {
    map.flyTo(position, 15, {
      animate: true,
      duration: 1.5
    });
  }
  return null;
}

interface MapProps {
  places: BeerSpot[];
  selectedPosition?: [number, number] | null;
  onAddPlace: (lat: number, lng: number) => void;
  isAddingMode?: boolean;
}

export default function Map({ places, selectedPosition, onAddPlace, isAddingMode }: MapProps) {
  return (
    <MapContainer 
      center={[55.6761, 12.5683]} 
      zoom={13} 
      zoomControl={false}
      style={{ height: "100%", width: "100%", cursor: isAddingMode ? "crosshair" : "grab" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />

      {/* Component to detect clicks - now triggers adding a place */}
      <MapClickHandler onMapClick={(latlng) => onAddPlace(latlng.lat, latlng.lng)} />
      
      {/* Component to update map view when selection changes */}
      <MapUpdater position={selectedPosition ?? null} />

      {/* Dynamic Markers from props */}
      {places.map((place) => (
        <Marker 
          key={place.id} 
          position={place.position} 
          icon={getMarkerIcon(place)}
        >
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-base m-0">{place.name}</h3>
              <p className="text-sm text-gray-500 capitalize m-0 mt-1">{place.category}</p>
              {place.description && (
                <p className="text-sm m-0 mt-2">{place.description}</p>
              )}
              {place.website && (
                <a 
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs block mt-2"
                >
                  Visit Website &rarr;
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}