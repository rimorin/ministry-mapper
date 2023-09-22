import { DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION } from "../constants";

const getDirection = (
  postalCode: string,
  country = DEFAULT_MAP_DIRECTION_CONGREGATION_LOCATION
) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${postalCode},${country}&travelmode=walking`;
};

export default getDirection;
