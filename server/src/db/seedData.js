/**
 * Starting data for a fresh store. Everything here can be edited
 * later from the admin panel (/admin).
 */

import fs from 'node:fs';
import { DEFAULT_CONTENT, DEFAULT_STORY_EXTRAS } from './contentDefaults.js';

// storeSnapshot.json = the real store (products, categories, settings) saved into the repo,
// so a fresh copy from GitHub opens with everything the admin panel had. Orders are never saved here.
const snapshotFile = new URL('./storeSnapshot.json', import.meta.url);
const snapshot = fs.existsSync(snapshotFile) ? JSON.parse(fs.readFileSync(snapshotFile, 'utf8')) : null;

const categories = [
  { id: 'cat-night', name: 'Night Dresses', slug: 'night-dresses', tagline: 'Slip into softness', tone: '#d9b8ad', sortOrder: 1 },
  { id: 'cat-pajama', name: 'Pajama Sets', slug: 'pajama-sets', tagline: 'Lazy mornings, sorted', tone: '#c9c2b4', sortOrder: 2 },
  { id: 'cat-robe', name: 'Robes', slug: 'robes', tagline: 'Wrapped in calm', tone: '#b9a59a', sortOrder: 3 },
  { id: 'cat-bra', name: 'Bras & Bralettes', slug: 'bras', tagline: 'Everyday comfort', tone: '#e2c6c0', sortOrder: 4 },
  { id: 'cat-panty', name: 'Panties', slug: 'panties', tagline: 'Second-skin basics', tone: '#cdb3a8', sortOrder: 5 },
  { id: 'cat-lounge', name: 'Loungewear', slug: 'loungewear', tagline: 'Home, but make it chic', tone: '#a9a195', sortOrder: 6 },
].map((c) => ({ ...c, image: '', createdAt: '2026-10-21T00:00:00.000Z', updatedAt: '2026-10-21T00:00:00.000Z' }));

const colors = {
  champagne: { name: 'Champagne', hex: '#e9d3bd' },
  blush: { name: 'Blush', hex: '#e7c1b8' },
  noir: { name: 'Noir', hex: '#2b2423' },
  wine: { name: 'Wine', hex: '#6e2a35' },
  ivory: { name: 'Ivory', hex: '#f3ece1' },
  sage: { name: 'Sage', hex: '#b6bda6' },
  mocha: { name: 'Mocha', hex: '#7b5b4c' },
  dusk: { name: 'Dusk Blue', hex: '#8d9bb0' },
};

const p = (slug, name, categoryId, price, comparePrice, colorKeys, extra = {}) => ({
  id: `prod-${slug}`,
  slug,
  name,
  categoryId,
  price,
  comparePrice,
  colors: colorKeys.map((k) => colors[k]),
  sizes: ['S', 'M', 'L', 'XL'],
  images: [],
  stock: 20,
  featured: false,
  isNew: false,
  active: true,
  description: '',
  details: ['Breathable, skin-friendly fabric', 'Gentle wash, dry in shade', 'Delivered in discreet packaging'],
  createdAt: '2026-10-21T00:00:00.000Z',
  updatedAt: '2026-10-21T00:00:00.000Z',
  ...extra,
});

const products = [
  p('luna-satin-slip', 'Luna Satin Slip', 'cat-night', 2450, 2990, ['champagne', 'noir', 'wine'], {
    featured: true, isNew: true,
    description: 'A bias-cut satin slip that pours over the body like moonlight. Adjustable straps and a soft cowl neckline.',
  }),
  p('rose-lace-chemise', 'Rose Lace Chemise', 'cat-night', 2190, null, ['blush', 'ivory'], {
    featured: true,
    description: 'Delicate scalloped lace meets a flowing chemise silhouette. Romantic, light and made for warm nights.',
  }),
  p('midnight-button-set', 'Midnight Button Set', 'cat-pajama', 3290, 3790, ['noir', 'dusk', 'champagne'], {
    featured: true,
    description: 'Classic piped shirt and wide-leg pant in fluid satin. The pajama set that feels like a hotel stay.',
  }),
  p('cloud-cotton-set', 'Cloud Cotton Set', 'cat-pajama', 2590, null, ['ivory', 'sage'], {
    isNew: true,
    description: 'Breathable cotton modal shorts set for humid nights. Soft, airy, and impossibly easy to wear.',
  }),
  p('velvet-dream-robe', 'Velvet Dream Robe', 'cat-robe', 3890, 4490, ['wine', 'mocha'], {
    featured: true,
    description: 'Plush velvet robe with a shawl collar and tie waist. Winter evenings, upgraded.',
  }),
  p('silk-kimono-robe', 'Silk Kimono Robe', 'cat-robe', 3490, null, ['champagne', 'noir'], {
    isNew: true,
    description: 'Lightweight kimono robe with wide sleeves. Throw it over any set and feel instantly put together.',
  }),
  p('soft-touch-bralette', 'Soft Touch Bralette', 'cat-bra', 1290, 1490, ['blush', 'noir', 'ivory'], {
    featured: true, sizes: ['32B', '34B', '34C', '36C', '38C'],
    description: 'Wire-free, padded bralette with a smooth finish. All-day comfort that disappears under clothes.',
  }),
  p('lace-plunge-bra', 'Lace Plunge Bra', 'cat-bra', 1590, null, ['wine', 'noir'], {
    sizes: ['32B', '34B', '34C', '36C', '38C'],
    description: 'Lightly lined plunge bra in floral lace for a flattering, natural lift.',
  }),
  p('everyday-brief-pack', 'Everyday Brief (Pack of 3)', 'cat-panty', 990, 1290, ['blush', 'ivory', 'mocha'], {
    featured: true,
    description: 'Seam-free cotton briefs in three soft neutrals. The basics you will reach for every day.',
  }),
  p('lace-trim-hipster', 'Lace Trim Hipster', 'cat-panty', 590, null, ['noir', 'blush'], {
    isNew: true,
    description: 'Mid-rise hipster with a lace waistband that never digs in.',
  }),
  p('ribbed-lounge-set', 'Ribbed Lounge Set', 'cat-lounge', 2890, 3290, ['mocha', 'sage', 'ivory'], {
    featured: true, isNew: true,
    description: 'Stretchy ribbed top and relaxed jogger. From couch to café without changing.',
  }),
  p('weekend-wrap-cardigan', 'Weekend Wrap Cardigan', 'cat-lounge', 2290, null, ['champagne', 'dusk'], {
    description: 'A soft-knit wrap cardigan to layer over everything you sleep and lounge in.',
  }),
];

const settings = {
  storeName: 'Saanjh',
  storeNameNepali: 'साँझ',
  tagline: 'Nightwear & intimates, made for you',
  announcement: 'Free delivery inside Kathmandu Valley on orders above Rs 3,000 ✦ Cash on Delivery available',
  currency: 'Rs',
  phone: '+977 98XXXXXXXX',
  email: 'hello@saanjh.com.np',
  address: 'Kathmandu, Nepal',
  social: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', tiktok: 'https://tiktok.com/' },
  shipping: { insideValley: 100, outsideValley: 150, freeAbove: 3000 },
  paymentMethods: ['Cash on Delivery', 'eSewa', 'Khalti'],
  // QR + account shown at checkout for each online method (set from /admin/settings)
  paymentDetails: {
    eSewa: { qr: '', name: '', id: '' },
    Khalti: { qr: '', name: '', id: '' },
  },
  heroSlides: [
    {
      id: 'hero-1',
      eyebrow: 'The Satin Edit',
      title: 'Soft nights,\nslow mornings.',
      subtitle: 'Satin slips, silky sets and robes designed to make bedtime feel like a ritual.',
      ctaText: 'Shop Night Dresses',
      ctaLink: '/shop?category=night-dresses',
      image: '',
      video: '',
      tone: '#cfa99c',
    },
    {
      id: 'hero-2',
      eyebrow: 'Everyday Intimates',
      title: 'Made to feel\nlike nothing.',
      subtitle: 'Wire-free bralettes and seam-free basics in shades that match your skin.',
      ctaText: 'Shop Intimates',
      ctaLink: '/shop?category=bras',
      image: '',
      video: '',
      tone: '#b8a397',
    },
  ],
  story: {
    eyebrow: 'Our Story',
    title: 'Comfort is the new luxury.',
    body: 'We started with a simple idea: what you wear when no one is watching should feel the most beautiful. Every piece is chosen for its fabric, fit and feel — then packed discreetly and delivered to your door anywhere in Nepal.',
    image: '',
    ...DEFAULT_STORY_EXTRAS,
  },
  content: DEFAULT_CONTENT,
  promises: [
    { title: 'Discreet Packaging', text: 'Plain, unbranded boxes. Always.' },
    { title: 'Cash on Delivery', text: 'Pay when it reaches you.' },
    { title: 'Easy Exchange', text: 'Size not right? Exchange within 7 days.' },
    { title: 'All Nepal Delivery', text: 'Valley in 1–2 days, outside in 3–5.' },
  ],
};

export const seedData = snapshot
  ? { categories: snapshot.categories, products: snapshot.products, orders: [], settings: snapshot.settings }
  : { categories, products, orders: [], settings };
