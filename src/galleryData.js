// ─── Gallery Scenarios ────────────────────────────────────────────────────────
// Each scenario is a COMPLETE try-on unit: model photo + garment photo.
// We provide full-body scenarios with straight posture as requested.
// The inference engine will be called live in GallerySection.jsx.

const Q = 'auto=format&fit=crop&q=80&w=600&h=800';

export const SCENARIOS = [
  // ── Women (Full-Body Scenarios) ─────────────────────────────────────────
  {
    id: 'w1', gender: 'Women', label: 'Elegant Evening Gown', category: 'Dress', accent: '#f9a8d4',
    model:   `/gallery/woman_model_1.png`,
    garment: `/gallery/woman_dress_1.png`,
  },
  {
    id: 'w2', gender: 'Women', label: 'Summer Maxi Dress', category: 'Dress', accent: '#fde68a',
    model:   `/gallery/woman_model_2.png`,
    garment: `/gallery/woman_dress_2.png`,
  },
  {
    id: 'w3', gender: 'Women', label: 'Chic Winter Coat', category: 'Coat', accent: '#a5b4fc',
    model:   `/gallery/woman_model_3.png`,
    garment: `/gallery/woman_dress_3.png`,
  },
  {
    id: 'w4', gender: 'Women', label: 'Casual Long Jumpsuit', category: 'Jumpsuit', accent: '#fdba74',
    model:   `/gallery/woman_model_4.png`,
    garment: `/gallery/woman_dress_4.png`,
  },
  {
    id: 'w5', gender: 'Women', label: 'Formal Floral Dress', category: 'Dress', accent: '#e0e7ff',
    model:   `/gallery/woman_model_5.png`,
    garment: `/gallery/woman_dress_5.png`,
  },

  // ── Men (Full-Body Scenarios) ───────────────────────────────────────────
  {
    id: 'm1', gender: 'Men', label: 'Classic Trench Coat Outfit', category: 'Coat', accent: '#818cf8',
    model:   `/gallery/man_model_1.png`,
    garment: `/gallery/man_outfit_1.png`,
  },
  {
    id: 'm2', gender: 'Men', label: 'Formal Suit Outfit', category: 'Suit', accent: '#93c5fd',
    model:   `/gallery/man_model_2.png`,
    garment: `/gallery/man_outfit_2.png`,
  },
  {
    id: 'm3', gender: 'Men', label: 'Winter Overcoat', category: 'Coat', accent: '#d1d5db',
    model:   `/gallery/man_model_3.png`,
    garment: `/gallery/man_outfit_3.png`,
  },
  {
    id: 'm4', gender: 'Men', label: 'Casual Streetwear', category: 'Casual', accent: '#86efac',
    model:   `/gallery/man_model_4.png`,
    garment: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${Q}`,
  },
  {
    id: 'm5', gender: 'Men', label: 'Basic White Tee', category: 'Casual', accent: '#fca5a5',
    model:   `https://images.unsplash.com/photo-1539108136458-37a5051616c8?${Q}`,
    garment: `https://images.unsplash.com/photo-1581655353564-df123a1eb820?${Q}`,
  },
]
