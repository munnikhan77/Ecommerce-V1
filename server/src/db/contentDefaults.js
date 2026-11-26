/**
 * Every piece of storefront wording that the shop owner can change in /admin/settings.
 * Older databases don't have these yet, so getSettings() fills any gap from here.
 * In titles, *word* becomes italic and a new line becomes a line break.
 */
export const DEFAULT_CONTENT = {
  sections: {
    // full-screen Women | Men choice right after the hero
    genderSplit: {
      show: true,
      women: { label: 'Women', subtitle: 'Satin, lace & soft cotton', image: '' },
      men: { label: 'Men', subtitle: 'Pajamas, robes & lounge', image: '' },
    },
    promises: { show: true },
    categories: { show: true, eyebrow: 'Shop by Category', title: 'Find your *kind* of comfort' },
    bestsellers: { show: true, eyebrow: 'Most Loved', title: 'Our *bestsellers*' },
    story: { show: true },
    newArrivals: { show: true, eyebrow: 'Just In', title: 'New *arrivals*', marquee: 'New in ✦ Just arrived' },
    social: { show: true, eyebrow: 'Follow along', title: 'Bedtime stories, *new drops*\n& real customers in our pieces.' },
  },
  search: {
    placeholder: 'Search satin, robes, bralettes…',
    popular: ['Satin', 'Lace', 'Robe', 'Pajama', 'Bralette', 'Cotton'],
  },
  product: {
    perks: ['Cash on Delivery available', 'Discreet, unbranded packaging', '7-day size exchange'],
    exchange: 'Size exchange within 7 days for unworn pieces with tags. All orders ship in plain, discreet packaging.',
    relatedEyebrow: 'Complete the look',
    relatedTitle: 'You may also like',
  },
  delivery: { valleyDays: '1–2 days', outsideDays: '3–5 days' },
  // the "saanjh" (dusk) touches: moon cursor, twinkling stars, sunset-to-night scroll bar
  mood: { cursor: true, stars: true, skyBar: true },
  footer: {
    help: ['Delivery all over Nepal', 'Cash on Delivery · eSewa · Khalti', '7-day size exchange', 'Discreet packaging'],
    note: 'Made with love in Nepal',
    // shown under the moon once you reach the very bottom of a page
    goodnight: 'शुभ रात्रि ✦',
  },
};

// the hero's people: one look per model, the middle one stands in front (PNG cut-outs)
export const DEFAULT_HERO_LOOKS = [
  {
    id: 'look-satin-slip',
    bg: '#8a6253', // tint of the soft shade behind the group
    image: '/uploads/hero-look-satin-slip.png',
    eyebrow: 'The Satin Edit',
    title: 'Satin\nnights.',
    subtitle: 'Bias-cut slips that pour over you like moonlight.',
    ctaText: 'Shop night dresses',
    ctaLink: '/women?category=night-dresses',
  },
  {
    id: 'look-lace',
    bg: '#c9b8a8',
    image: '/uploads/hero-look-lace.png',
    eyebrow: 'The Lace Edit',
    title: 'Soft\nlace.',
    subtitle: 'Light chemises with delicate lace, made for warm nights.',
    ctaText: 'Shop lace',
    ctaLink: '/product/rose-lace-chemise',
  },
  {
    id: 'look-black-slip',
    bg: '#5a4036',
    image: '/uploads/hero-look-black-slip.png',
    eyebrow: 'After Dark',
    title: 'Little\nblack slip.',
    subtitle: 'One strap down, nowhere to be. Silky slips in classic black.',
    ctaText: 'Shop slips',
    ctaLink: '/product/luna-satin-slip',
  },
];

export const DEFAULT_STORY_EXTRAS = {
  stamp: 'Est. 2026 · Kathmandu',
  // small round photos that sit between the words of the story title
  pills: ['/uploads/unsplash-luna-0.jpg', '/uploads/unsplash-kimono-0.jpg'],
  values: [
    { title: 'Hand-picked fabrics', text: 'Satin, modal and soft cotton — chosen by touch, not by catalogue.' },
    { title: 'Discreet packaging', text: 'Plain boxes, no logos. What’s inside is yours to know.' },
    { title: 'Delivered across Nepal', text: 'Valley in 1–2 days, everywhere else in 3–5.' },
  ],
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// defaults underneath, saved values on top (arrays are replaced, not merged)
function merge(base, saved) {
  if (!isObject(base) || !isObject(saved)) return saved === undefined ? base : saved;
  const out = { ...base };
  for (const key of Object.keys(saved)) out[key] = merge(base[key], saved[key]);
  return out;
}

export function withContentDefaults(settings) {
  return {
    ...settings,
    storeNameNepali: settings.storeNameNepali ?? 'साँझ',
    heroLooks: settings.heroLooks ?? DEFAULT_HERO_LOOKS,
    content: merge(DEFAULT_CONTENT, settings.content ?? {}),
    story: merge(DEFAULT_STORY_EXTRAS, settings.story ?? {}),
  };
}
