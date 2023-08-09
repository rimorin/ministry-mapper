/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import Loader from "../statics/loader";

const SuspenseComponent = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

export default SuspenseComponent;
