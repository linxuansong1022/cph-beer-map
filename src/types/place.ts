export interface BeerSpot {
  id: string;
  name: string;
  description?: string; // ? 表示这个字段是可选的
  position: [number, number]; // [纬度, 经度]
  category: 'brewery' | 'bar' | 'shop'; // 限制只能是这三个字符串之一
  website?: string;
  logoUrl?: string; // Optional URL for the place's logo image
}
