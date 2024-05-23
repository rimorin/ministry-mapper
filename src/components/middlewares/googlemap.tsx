import { FC, ReactNode } from "react";

import { APIProvider } from "@vis.gl/react-google-maps";
interface MapsMiddlewareProps {
  children: ReactNode;
}

const MapsMiddleware: FC<MapsMiddlewareProps> = ({ children }) => {
  const { VITE_GOOGLE_MAPS_API_KEY } = import.meta.env;
  if (!VITE_GOOGLE_MAPS_API_KEY) {
    return <div>Missing Google Maps API Key</div>;
  }
  return (
    <APIProvider apiKey={VITE_GOOGLE_MAPS_API_KEY}>{children}</APIProvider>
  );
};

export default MapsMiddleware;
