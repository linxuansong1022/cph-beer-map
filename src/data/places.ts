import { BeerSpot } from '../types/place';

export const places: BeerSpot[] = [
  {
    id: 'warpigs',
    name: 'Warpigs Brewpub',
    description: 'Texas barbecue and American-Danish style beers.',
    position: [55.671, 12.565], // 之前 Map.tsx 里的坐标
    category: 'brewery',
    website: 'https://warpigs.dk'
  },
  {
    id: 'brus',
    name: 'BRUS',
    description: 'Brewery, restaurant, bar and shop in Nørrebro.',
    position: [55.6923, 12.5562],
    category: 'brewery',
    website: 'https://tapperietbrus.dk'
  },
  {
    id: 'mikkeller-bar-viktoriagade',
    name: 'Mikkeller Bar',
    description: 'The original Mikkeller bar.',
    position: [55.6719, 12.5575],
    category: 'bar',
    website: 'https://mikkeller.com'
  },
  {
    id: 'bootleggers-torvehallerne',
    name: 'Bootleggers Craft Beer Bar',
    description: 'Located at the beautiful Torvehallerne food market.',
    position: [55.6836, 12.5721],
    category: 'bar'
  }
];
