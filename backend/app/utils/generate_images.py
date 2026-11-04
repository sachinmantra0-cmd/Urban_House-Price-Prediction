import os
from pathlib import Path

categories = {
    'exterior': ('#1e293b', '#3b82f6', 'Exterior Architecture', 'Contemporary Indian Residential Facade'),
    'living_room': ('#0f172a', '#10b981', 'Living Room', 'Spacious Hall with Natural Light & Modern Accents'),
    'bedroom': ('#1e1b4b', '#8b5cf6', 'Master Bedroom', 'Elegant Bedroom with Wooden Flooring & Wardrobe'),
    'kitchen': ('#1c1917', '#f59e0b', 'Modular Kitchen', 'Modern Granite Countertop & Cabinetry'),
    'bathroom': ('#0c4a6e', '#06b6d4', 'Modern Bathroom', 'Vitrified Tiles & Premium Sanitaryware'),
    'balcony': ('#14532d', '#22c55e', 'Scenic Balcony', 'Outdoor Seating with City View & Planters'),
    'floor_plan': ('#334155', '#64748b', 'Architectural Floor Plan', '2D Spatial Layout & Dimension Specifications')
}

def generate_local_images(base_dir: str = "property_image"):
    os.makedirs(base_dir, exist_ok=True)
    for cat, (bg, accent, title, sub) in categories.items():
        cat_dir = os.path.join(base_dir, cat)
        os.makedirs(cat_dir, exist_ok=True)
        for i in range(1, 4):
            svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="grad_{cat}_{i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg}" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad_{cat}_{i})" />
  <rect x="40" y="40" width="720" height="520" rx="16" fill="none" stroke="{accent}" stroke-width="2" stroke-dasharray="6 6" opacity="0.4" />
  <circle cx="400" cy="240" r="80" fill="{accent}" opacity="0.15" />
  <text x="400" y="248" font-family="sans-serif" font-size="34" font-weight="bold" fill="{accent}" text-anchor="middle">{title} #{i}</text>
  <text x="400" y="330" font-family="sans-serif" font-size="20" fill="#f8fafc" text-anchor="middle">{sub}</text>
  <text x="400" y="370" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">HouseEstiMate Curated Illustrative Sample Image</text>
  <rect x="290" y="420" width="220" height="36" rx="8" fill="{accent}" opacity="0.2" />
  <text x="400" y="444" font-family="sans-serif" font-size="13" font-weight="600" fill="{accent}" text-anchor="middle">PROVENANCE: DEMO PHOTO</text>
</svg>"""
            filepath = os.path.join(cat_dir, f"sample_{i}.svg")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(svg_content)
    print("Local sample SVG images created across all 7 categories.")

if __name__ == "__main__":
    generate_local_images()
