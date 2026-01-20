'use client';

import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import AddPlaceModal from '../components/AddPlaceModal';
import { useState } from 'react';
import { BeerSpot } from '../types/place';
import { places } from '../data/places';

// Dynamic import with ssr: false to prevent window is not defined error
const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading map...</div>
});

export default function Home() {
  const [allPlaces, setAllPlaces] = useState<BeerSpot[]>(places);
  const [selectedPlace, setSelectedPlace] = useState<BeerSpot | null>(null);
  
  // State for the new place modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPosition, setTempPosition] = useState<[number, number] | null>(null);

  // Triggered when user clicks on the map
  const handleMapClick = (lat: number, lng: number) => {
    setTempPosition([lat, lng]);
    setIsModalOpen(true);
  };

  // Triggered when user submits the modal form
  const handleSavePlace = (data: Omit<BeerSpot, "id" | "position">) => {
    if (!tempPosition) return;

    const newPlace: BeerSpot = {
      id: Date.now().toString(),
      position: tempPosition,
      ...data
    };

    setAllPlaces([...allPlaces, newPlace]);
    setIsModalOpen(false);
    setTempPosition(null);
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Sidebar places={allPlaces} onSelect={(place) => setSelectedPlace(place)} />
      <div className="flex-1 relative h-full">
        <Map 
          places={allPlaces} 
          selectedPosition={selectedPlace?.position} 
          onAddPlace={handleMapClick}
        />
      </div>

      <AddPlaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePlace} 
      />
    </main>
  );
}