/** Format city + country for admin lists (pure — safe for client components). */
export function formatUserLocation(input: {
  city?: string | null;
  country?: string | null;
}): string | null {
  const city = input.city?.trim() || null;
  const country = input.country?.trim() || null;
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}
