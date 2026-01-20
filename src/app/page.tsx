'use client';

import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import AddPlaceModal from '../components/AddPlaceModal';
import { useState, useEffect } from 'react';
import { BeerSpot } from '../types/place';

// Dynamic import with ssr: false to prevent window is not defined error
const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading map...</div>
});

export default function Home() {
  const [allPlaces, setAllPlaces] = useState<BeerSpot[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<BeerSpot | null>(null);
  
  // State for the new place modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPosition, setTempPosition] = useState<[number, number] | null>(null);

  // State for sidebar (responsive)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for adding mode
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Open sidebar by default on large screens
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Fetch places from Backend API
  useEffect(() => {
    fetch('http://127.0.0.1:8000/places')
      .then((res) => res.json())
      .then((data) => {
        // Map backend data to frontend BeerSpot type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPlaces: BeerSpot[] = data.map((p: any) => ({
          id: p.slug, // Use slug as string ID
          name: p.name,
          description: p.description,
          position: p.position,
          category: p.category,
          website: p.website,
          logoUrl: p.logo_url, // Map snake_case to camelCase
        }));
        setAllPlaces(mappedPlaces);
      })
      .catch((err) => console.error('Failed to fetch places:', err));
  }, []);

  // Triggered when user clicks on the map
  const handleMapClick = (lat: number, lng: number) => {
    if (!isAddingMode) return;

    setTempPosition([lat, lng]);
    setIsModalOpen(true);
    setIsAddingMode(false); // Exit adding mode after clicking
  };

  // Triggered when user submits the modal form
  const handleSavePlace = async (data: Omit<BeerSpot, "id" | "position">) => {
    if (!tempPosition) return;

    const slug = Date.now().toString(); // Use timestamp as a simple unique slug

    const payload = {
      slug: slug,
      name: data.name,
      description: data.description,
      category: data.category,
      website: data.website,
      logo_url: data.logoUrl,
      lat: tempPosition[0],
      lng: tempPosition[1]
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedPlace = await res.json();
        // Convert back to BeerSpot
        const newSpot: BeerSpot = {
          id: savedPlace.slug,
          name: savedPlace.name,
          description: savedPlace.description,
          position: savedPlace.position,
          category: savedPlace.category,
          website: savedPlace.website,
          logoUrl: savedPlace.logo_url
        };

        setAllPlaces([...allPlaces, newSpot]);
        setIsModalOpen(false);
        setTempPosition(null);
      } else {
        console.error("Failed to save place");
      }
    } catch (err) {
      console.error("Error saving place:", err);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden relative">
      <Sidebar 
        places={allPlaces} 
        onSelect={(place) => setSelectedPlace(place)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAddingMode={isAddingMode}
        onToggleAddingMode={() => setIsAddingMode(!isAddingMode)}
      />

      {/* Toggle Sidebar Button - Moved to Main container */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          fixed top-4 z-[9999] bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 left-4
          ${isSidebarOpen ? 'md:left-[21rem]' : ''}
        `}
        aria-label="Toggle Menu"
      >
        {isSidebarOpen ? (
          // Close / Chevron Left Icon (Desktop only)
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          // Hamburger Menu Icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 relative h-full transition-all duration-300">
        <Map 
          places={allPlaces} 
          selectedPosition={selectedPlace?.position} 
          onAddPlace={handleMapClick}
          isAddingMode={isAddingMode}
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