import { DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION } from "../constants";

const getDirection = (
  postalCode: string,
  country = DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
) => {
  const travelMode =
    country !== DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
      ? ""
      : "&travelmode=walking";

  const destination = encodeURIComponent(`${postalCode},${country}`);

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${travelMode}`;
};

export default getDirection;
