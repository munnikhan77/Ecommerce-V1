export const formatPrice = (amount, currency = 'Rs') =>
  `${currency} ${Number(amount || 0).toLocaleString('en-IN')}`;

export const discountPercent = (price, comparePrice) =>
  comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Turn "Soft nights,\nslow mornings." into lines for headings
export const toLines = (text = '') => text.split('\n');
