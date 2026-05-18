/**
 * Haversine formula — returns the great-circle distance between two points
 * on Earth, given their lat/lng in decimal degrees.
 * @param {object} a  { lat, lng }
 * @param {object} b  { lat, lng }
 * @returns {number}  Distance in km (rounded to integer)
 */
export function haversineDistance(a, b) {
  const R = 6371; // Earth radius in km
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinDLat * sinDLat +
          Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
      )
    );

  return Math.round(R * c);
}

/**
 * Returns a closeness label + CSS class name based on distance.
 * Thresholds can be tuned freely.
 */
export function getProximityHint(distanceKm) {
  if (distanceKm === 0)    return { label: "¡Es ese! 🎯",   cls: "exact"    };
  if (distanceKm < 1000)   return { label: "Muy cerca 🔥",  cls: "very-hot" };
  if (distanceKm < 3000)   return { label: "Cerca 🟠",      cls: "hot"      };
  if (distanceKm < 6000)   return { label: "Lejos 🟡",      cls: "warm"     };
  return                          { label: "Muy lejos 🔵",  cls: "cold"     };
}