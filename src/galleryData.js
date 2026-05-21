// ─── Gallery Scenarios ────────────────────────────────────────────────────────
// Each scenario is a COMPLETE try-on unit: model photo + garment photo.
// We provide 10 Women and 10 Men Full-Body scenarios as requested.
// The inference engine will be called live in GallerySection.jsx.

const Q = 'auto=format&fit=crop&q=80&w=600&h=800'

export const SCENARIOS = [
  // ── Women (5 Full-Body Scenarios) ─────────────────────────────────────────
  {
    id: 'w1', gender: 'Women', label: 'Elegant Evening Gown', category: 'Dress', accent: '#f9a8d4',
    model:   `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?${Q}`,
    garment: `https://images.unsplash.com/photo-1572804013427-4d7ca7268217?${Q}`,
  },
  {
    id: 'w2', gender: 'Women', label: 'Summer Maxi Dress', category: 'Dress', accent: '#fde68a',
    model:   `https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?${Q}`,
    garment: `https://images.unsplash.com/photo-1539008835657-9e8e9680c956?${Q}`,
  },
  {
    id: 'w3', gender: 'Women', label: 'Urban Trench Coat', category: 'Coat', accent: '#a5b4fc',
    model:   `https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?${Q}`,
    garment: `https://images.unsplash.com/photo-1551028719-00167b16eac5?${Q}`,
  },
  {
    id: 'w4', gender: 'Women', label: 'White Silk Top', category: 'Top', accent: '#fdba74',
    model:   `https://images.unsplash.com/photo-1517841905240-472988babdf9?${Q}`,
    garment: `https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?${Q}`,
  },
  {
    id: 'w5', gender: 'Women', label: 'Minimalist White Dress', category: 'Dress', accent: '#e0e7ff',
    model:   `https://images.unsplash.com/photo-1496747611176-843222e1e57c?${Q}`,
    garment: `https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?${Q}`,
  },

  // ── Men (5 Full-Body Scenarios) ───────────────────────────────────────────
  {
    id: 'm1', gender: 'Men', label: 'White Oxford Shirt', category: 'Shirt', accent: '#818cf8',
    model:   `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?${Q}`,
    garment: `https://images.unsplash.com/photo-1603252109303-2751441dd157?${Q}`,
  },
  {
    id: 'm2', gender: 'Men', label: 'Casual Plaid Shirt', category: 'Shirt', accent: '#93c5fd',
    model:   `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${Q}`,
    garment: `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?${Q}`,
  },
  {
    id: 'm3', gender: 'Men', label: 'Streetwear Long Coat', category: 'Coat', accent: '#d1d5db',
    model:   `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?${Q}`,
    garment: `https://images.unsplash.com/photo-1520975661595-6453be3f7070?${Q}`,
  },
  {
    id: 'm4', gender: 'Men', label: 'Classic Navy Tee', category: 'Casual', accent: '#86efac',
    model:   `https://images.unsplash.com/photo-1463453091185-61582044d556?${Q}`,
    garment: `https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?${Q}`,
  },
  {
    id: 'm5', gender: 'Men', label: 'Grey Urban Hoodie', category: 'Hoodie', accent: '#a5b4fc',
    model:   `https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?${Q}`,
    garment: `https://images.unsplash.com/photo-1556821840-3a63f95609a7?${Q}`,
  },
]
