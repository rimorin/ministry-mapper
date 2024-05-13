import { Card } from "react-bootstrap";

interface ControlPanelProps {
  lat: number;
  lng: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ lat, lng }) => {
  return (
    <Card
      style={{
        width: "15rem",
        bottom: 10,
        left: 0,
        position: "absolute",
        margin: "24px"
      }}
    >
      <Card.Body>
        <div
          style={{
            maxWidth: "90%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          Latitude: {lat}
        </div>
        <div
          style={{
            maxWidth: "90%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          Longitude: {lng}
        </div>
      </Card.Body>
    </Card>
  );
};
