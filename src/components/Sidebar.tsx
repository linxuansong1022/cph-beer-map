import { BeerSpot } from "../types/place";

interface SidebarProps {
  places: BeerSpot[];
  onSelect: (place: BeerSpot) => void;
}

export default function Sidebar({ places, onSelect }: SidebarProps) {
  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 overflow-y-auto p-4 shadow-lg z-10 relative">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Cph Beer Map 🍺</h1>
      
      <div className="space-y-4">
        {places.map((place) => (
          <div 
            key={place.id} 
            onClick={() => onSelect(place)}
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
  );
}