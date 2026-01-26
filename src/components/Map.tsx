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

// Define User Location Icon (Reliable Cheers Icon)
const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/931/931949.png",
  iconSize: [50, 50],  // Slightly larger for visibility
  iconAnchor: [25, 50], // Bottom center
  popupAnchor: [0, -50], // Popup above the head
  // No shadow for this custom character to keep it clean
});

// Function to choose the right icon based on place data
const getMarkerIcon = (place: BeerSpot) => {
  // If the place has a logo, use it as a custom marker
  if (place.logoUrl) {
    return L.divIcon({
      className: '', // Empty class to avoid default styles interfering too much if we fully style inner div
      html: `<div class="w-12 h-12 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden relative flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
               <img 
                 src="${place.logoUrl}" 
                 class="w-full h-full object-cover" 
                 alt="${place.name}" 
                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=random&color=fff&size=128&bold=true';"
               />
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
  userLocation?: [number, number] | null;
}

export default function Map({ places, selectedPosition, onAddPlace, isAddingMode, userLocation }: MapProps) {
  return (
    <MapContainer 
      center={[55.6761, 12.5683]} 
      zoom={13} 
      zoomControl={false}
      style={{ height: "100%", width: "100%", cursor: isAddingMode ? "crosshair" : "grab" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />

      {/* Component to detect clicks - now triggers adding a place */}
      <MapClickHandler onMapClick={(latlng) => onAddPlace(latlng.lat, latlng.lng)} />
      
      {/* Component to update map view when selection changes */}
      <MapUpdater position={selectedPosition ?? null} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg m-0">You are here! 🍻</h3>
              <p className="text-xs text-gray-500 m-0">Ready for a drink?</p>
            </div>
          </Popup>
        </Marker>
      )}

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
              
              {/* Rating Display */}
              {place.rating && (
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-bold">{place.rating}</span>
                  {place.user_ratings_total && (
                    <span className="text-gray-400 text-xs">({place.user_ratings_total})</span>
                  )}
                </div>
              )}

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