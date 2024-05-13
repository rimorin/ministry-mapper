import { DEFAULT_COORDINATES } from "../constants";

const getDirection = (coordinates = DEFAULT_COORDINATES.Singapore) => {
  const destination = encodeURIComponent(
    `${coordinates.lat},${coordinates.lng}`
  );

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

export default getDirection;
