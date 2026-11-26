// The shop is split into Women and Men. A category is for 'women', 'men' or 'unisex' (both).
export const GENDERS = [
  { key: 'women', label: 'Women', path: '/women' },
  { key: 'men', label: 'Men', path: '/men' },
];

export const genderInfo = (key) => GENDERS.find((g) => g.key === key);

export const categoriesFor = (categories, gender) =>
  gender ? categories.filter((c) => c.gender === gender || c.gender === 'unisex') : categories;
