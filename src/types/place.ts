export interface BeerSpot {
  id: string;
  name: string;
  description?: string; 
  position: [number, number]; 
  category: 'brewery' | 'bar' | 'shop'; 
  website?: string;
}
