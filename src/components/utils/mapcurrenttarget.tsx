import { MapControl, ControlPosition } from "@vis.gl/react-google-maps";
import TargetImage from "../../assets/target.svg?react";
interface MapControlProps {
  onClick: () => void;
  isLocating: boolean;
}

export const MapCurrentTarget: React.FC<MapControlProps> = ({
  onClick,
  isLocating
}) => {
  return (
    <MapControl position={ControlPosition.INLINE_END_BLOCK_END}>
      <TargetImage
        style={{
          cursor: "pointer",
          marginRight: "20px",
          animation: isLocating ? "spinLocator 2s linear infinite" : ""
        }}
        onClick={onClick}
      />
    </MapControl>
  );
};
