import { BeerSpot } from "../types/place";

interface SidebarProps {
  places: BeerSpot[];
  onSelect: (place: BeerSpot) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ places, onSelect, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay (Background Dim) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40 h-full bg-white border-r border-gray-200 shadow-2xl md:shadow-none
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0 w-80 p-4' : '-translate-x-full w-0 p-0 border-none md:translate-x-0 md:w-0'}
      `}>
        <div className="flex justify-between items-center mb-6 w-72"> {/* Fixed width container to prevent text wrap during transition */}
          <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">Cph Beer Map 🍺</h1>
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 md:hidden text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 w-72"> {/* Fixed width content */}
          {places.map((place) => (
            <div 
              key={place.id} 
              onClick={() => {
                onSelect(place);
                // On mobile, close sidebar. On desktop, keep it open.
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-gray-900">{place.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  place.category === 'brewery' ? 'bg-red-100 text-red-800' :
                  place.category === 'shop' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {place.category}
                </span>
              </div>
              
              {place.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {place.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}