import haversine from "haversine-distance";

export const calculateDistanceAndFare = (
  pickup: [number, number],
  destination: [number, number],
  baseFarePerKm = 100
) => {
  const [pickupLng, pickupLat] = pickup;
  const [destLng, destLat] = destination;

  const distanceInMeters = haversine(
    { lat: pickupLat, lon: pickupLng },
    { lat: destLat, lon: destLng }
  );

  const distanceKm = parseFloat((distanceInMeters / 1000).toFixed(2));
  const fare = parseFloat((distanceKm * baseFarePerKm).toFixed(2));

  return { distanceKm, fare };
};