import { BeerSpot } from '../types/place';

export const places: BeerSpot[] = [
  {
    id: 'warpigs',
    name: 'Warpigs Brewpub',
    description: 'Texas barbecue and American-Danish style beers.',
    position: [55.671, 12.565], // 之前 Map.tsx 里的坐标
    category: 'brewery',
    website: 'https://warpigs.dk',
    logoUrl: 'https://ui-avatars.com/api/?name=Warpigs&background=ef4444&color=fff&size=128&bold=true'
  },
  {
    id: 'brus',
    name: 'BRUS',
    description: 'Brewery, restaurant, bar and shop in Nørrebro.',
    position: [55.6923, 12.5562],
    category: 'brewery',
    website: 'https://tapperietbrus.dk',
    logoUrl: 'https://ui-avatars.com/api/?name=BRUS&background=10b981&color=fff&size=128&bold=true'
  },
  {
    id: 'mikkeller-bar-viktoriagade',
    name: 'Mikkeller Bar',
    description: 'The original Mikkeller bar.',
    position: [55.6719, 12.5575],
    category: 'bar',
    website: 'https://mikkeller.com',
    logoUrl: 'https://ui-avatars.com/api/?name=Mikkeller&background=3b82f6&color=fff&size=128&bold=true'
  },
  {
    id: 'bootleggers-torvehallerne',
    name: 'Bootleggers Craft Beer Bar',
    description: 'Located at the beautiful Torvehallerne food market.',
    position: [55.6836, 12.5721],
    category: 'bar',
    logoUrl: 'https://ui-avatars.com/api/?name=Bootleggers&background=f59e0b&color=fff&size=128&bold=true'
  }
];
