// data/mockImages.ts

const FILENAMES = [
  "mountain-sunset.jpg",
  "city-lights.jpg",
  "forest-path.jpg",
  "ocean-waves.jpg",
  "desert-dunes.jpg",
  "snowy-peaks.jpg",
  "cherry-blossoms.jpg",
  "autumn-leaves.jpg",
  "waterfall.jpg",
  "night-sky.jpg",
  "green-valley.jpg",
  "rocky-coast.jpg",
  "tropical-beach.jpg",
  "misty-morning.jpg",
  "golden-hour.jpg",
  "river-bend.jpg",
  "canyon-view.jpg",
  "lakeside-cabin.jpg",
];

const SIZES = [
  { w: 800, h: 600 },
  { w: 1200, h: 800 },
  { w: 600, h: 900 },
  { w: 1920, h: 1080 },
  { w: 1080, h: 1080 },
  { w: 1600, h: 900 },
];

const MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MOCK_IMAGES = Array.from({ length: 18 }, (_, i) => {
  const dim = SIZES[i % SIZES.length];
  return {
    _id: `img-${i}`,
    originalFilename: FILENAMES[i],
    cdnUrl: `https://picsum.photos/seed/${i + 42}/${dim.w}/${dim.h}`,
    dimensions: { width: dim.w, height: dim.h },
    sizeBytes: Math.floor(Math.random() * 5000000) + 200000,
    mimeType: MIME_TYPES[i % MIME_TYPES.length],
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    metadata: {
      altText: FILENAMES[i].replace(/-/g, " ").replace(".jpg", ""),
      tags: ["nature", i % 2 === 0 ? "landscape" : "portrait"],
    },
  };
});
