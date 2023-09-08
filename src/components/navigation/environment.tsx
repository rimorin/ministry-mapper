import { lazy, memo } from "react";
import SuspenseComponent from "../utils/suspense";
const ProgressBar = SuspenseComponent(
  lazy(() => import("react-bootstrap/ProgressBar"))
);

const EnvironmentIndicator = memo(() => {
  if (import.meta.env.VITE_ROLLBAR_ENVIRONMENT?.startsWith("production"))
    return <></>;
  return (
    <ProgressBar
      now={100}
      animated
      style={{
        borderRadius: 0,
        position: "sticky",
        top: 0,
        fontWeight: "bold",
        zIndex: 1000
      }}
      label={`${import.meta.env.VITE_ROLLBAR_ENVIRONMENT} environment`}
    />
  );
});

export default EnvironmentIndicator;
