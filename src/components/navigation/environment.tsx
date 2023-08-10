import { memo } from "react";
import { lazy, Suspense } from "react";
import Loader from "../statics/loader";
const ProgressBar = lazy(() => import("react-bootstrap/ProgressBar"));

const EnvironmentIndicator = memo(() => {
  if (process.env.REACT_APP_ROLLBAR_ENVIRONMENT?.startsWith("production"))
    return <></>;
  return (
    <Suspense fallback={<Loader />}>
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
        label={`${process.env.REACT_APP_ROLLBAR_ENVIRONMENT} environment`}
      />
    </Suspense>
  );
});

export default EnvironmentIndicator;
