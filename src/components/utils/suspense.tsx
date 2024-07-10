/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { Spinner } from "react-bootstrap";

const SuspenseComponent = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => {
    return (
      <Suspense
        fallback={
          <div className="suspense-loader">
            <Spinner animation="border" variant="primary" />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
};

export default SuspenseComponent;
