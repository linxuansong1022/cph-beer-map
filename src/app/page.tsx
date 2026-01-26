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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
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
  const fetchPlaces = async (url: string = 'http://127.0.0.1:8000/places') => {
    try {
      console.log(`Fetching places from: ${url}`);
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error(`Fetch failed with status: ${res.status}`);
        return;
      }

      const data = await res.json();
      
      // Map backend data to frontend BeerSpot type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedPlaces: BeerSpot[] = data.map((p: any) => ({
        id: p.slug, // Use slug as string ID
        name: p.name,
        description: p.description,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        position: p.position,
        category: p.category,
        website: p.website,
        logoUrl: p.logo_url, // Map snake_case to camelCase
      }));
      setAllPlaces(mappedPlaces);
    } catch (err) {
      console.error('Failed to fetch places:', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Find Nearby Places Logic
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Searching nearby: ${latitude}, ${longitude}`);
        setUserLocation([latitude, longitude]); // Set user marker
        fetchPlaces(`http://127.0.0.1:8000/places/nearby?lat=${latitude}&lng=${longitude}&radius=2000`);
      },
      (error) => {
        console.warn("Geolocation failed/denied, falling back to Copenhagen City Center for demo.");
        // Fallback to CPH City Center
        const lat = 55.6761;
        const lng = 12.5683;
        setUserLocation([lat, lng]); // Set user marker
        fetchPlaces(`http://127.0.0.1:8000/places/nearby?lat=${lat}&lng=${lng}&radius=2000`);
      }
    );
  };

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

    // Generate a default logo if none provided
    let finalLogoUrl = data.logoUrl;
    
    if (!finalLogoUrl) {
      // Logic 1: Try to get logo from website using Google Favicon API (More reliable than Clearbit)
      if (data.website) {
        try {
          // Extract hostname (e.g., "https://warpigs.dk" -> "warpigs.dk")
          const url = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`);
          finalLogoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
        } catch (e) {
          console.warn("Could not parse website URL for logo generation", e);
        }
      }

      // Logic 2: Fallback to UI Avatars if still no logo (or no website)
      if (!finalLogoUrl) {
        // Use UI Avatars API to generate a placeholder based on the name
        // background=random makes it colorful
        finalLogoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128&bold=true`;
      }
    }

    const payload = {
      slug: slug,
      name: data.name,
      description: data.description,
      category: data.category,
      website: data.website,
      logo_url: finalLogoUrl,
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

  // Handle deleting a place
  const handleDeletePlace = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/places/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove from local state immediately for snappy UI
        setAllPlaces(prev => prev.filter(p => p.id !== id));
        // Also clear selection if the deleted place was selected
        if (selectedPlace?.id === id) {
          setSelectedPlace(null);
        }
      } else {
        console.error("Failed to delete place");
        alert("Failed to delete place. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting place:", err);
      alert("Error connecting to server.");
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
        onDelete={handleDeletePlace}
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

      {/* Find Nearby Button (Radar) - Positioned on map */}
      <button 
        onClick={handleFindNearby}
        className="fixed bottom-8 right-4 z-[9999] bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 md:bottom-8 md:right-16"
        title="Find bars near me"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <div className="flex-1 relative h-full transition-all duration-300">
        <Map 
          places={allPlaces} 
          selectedPosition={selectedPlace?.position} 
          onAddPlace={handleMapClick}
          isAddingMode={isAddingMode}
          userLocation={userLocation} // Pass the new prop
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