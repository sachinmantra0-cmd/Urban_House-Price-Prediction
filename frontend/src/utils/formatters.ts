export function formatPriceINR(priceInr: number): string {
  if (!priceInr || priceInr <= 0) return 'Price on Request';
  if (priceInr >= 10000000) {
    const cr = priceInr / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  } else if (priceInr >= 100000) {
    const lakh = priceInr / 100000;
    return `₹${lakh.toFixed(2)} Lakh`;
  }
  return `₹${Math.round(priceInr).toLocaleString('en-IN')}`;
}

export function formatPriceLakhs(lakhs: number): string {
  if (!lakhs || lakhs <= 0) return 'Price on Request';
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return `₹${cr.toFixed(2)} Cr`;
  }
  return `₹${lakhs.toFixed(2)} Lakh`;
}

export function formatArea(areaSqft: number): string {
  if (!areaSqft) return 'N/A';
  return `${Math.round(areaSqft).toLocaleString('en-IN')} sq ft`;
}
