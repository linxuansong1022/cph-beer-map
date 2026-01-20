import requests

# 原始数据 (从 src/data/places.ts 复制)
places_data = [
  {
    "slug": "warpigs",
    "name": "Warpigs Brewpub",
    "description": "Texas barbecue and American-Danish style beers.",
    "lat": 55.671, 
    "lng": 12.565,
    "category": "brewery",
    "website": "https://warpigs.dk",
    "logo_url": "https://ui-avatars.com/api/?name=Warpigs&background=ef4444&color=fff&size=128&bold=true"
  },
  {
    "slug": "brus",
    "name": "BRUS",
    "description": "Brewery, restaurant, bar and shop in Nørrebro.",
    "lat": 55.6923,
    "lng": 12.5562,
    "category": "brewery",
    "website": "https://tapperietbrus.dk",
    "logo_url": "https://ui-avatars.com/api/?name=BRUS&background=10b981&color=fff&size=128&bold=true"
  },
  {
    "slug": "mikkeller-bar-viktoriagade",
    "name": "Mikkeller Bar",
    "description": "The original Mikkeller bar.",
    "lat": 55.6719,
    "lng": 12.5575,
    "category": "bar",
    "website": "https://mikkeller.com",
    "logo_url": "https://ui-avatars.com/api/?name=Mikkeller&background=3b82f6&color=fff&size=128&bold=true"
  },
  {
    "slug": "bootleggers-torvehallerne",
    "name": "Bootleggers Craft Beer Bar",
    "description": "Located at the beautiful Torvehallerne food market.",
    "lat": 55.6836,
    "lng": 12.5721,
    "category": "bar",
    "logo_url": "https://ui-avatars.com/api/?name=Bootleggers&background=f59e0b&color=fff&size=128&bold=true"
  }
]

API_URL = "http://127.0.0.1:8000/places"

def seed_db():
    print(f"Adding places to {API_URL}...")
    for place in places_data:
        try:
            response = requests.post(API_URL, json=place)
            if response.status_code == 200:
                print(f"✅ Added: {place['name']}")
            elif response.status_code == 400 and "already exists" in response.text:
                 print(f"⚠️ Skipped (Already exists): {place['name']}")
            else:
                print(f"❌ Failed: {place['name']} - {response.status_code} {response.text}")
        except Exception as e:
            print(f"❌ Error connecting to API: {e}")

if __name__ == "__main__":
    seed_db()
