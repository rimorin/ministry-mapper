import { FC, useState, useEffect, ReactNode, Suspense, lazy } from "react";
import { child, onValue, ref } from "firebase/database";
import { database } from "../../firebase";
import Loader from "../statics/loader";
const MaintenanceMode = lazy(() => import("../statics/maintenance"));

interface MaintenanceMiddlewareProps {
  children: ReactNode;
}

const MaintenanceMiddleware: FC<MaintenanceMiddlewareProps> = ({
  children
}) => {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);

  useEffect(() => {
    const maintenanceReference = child(ref(database), `/maintenance`);
    onValue(maintenanceReference, (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.val());
      }
    });
  }, []);

  if (isMaintenance)
    return (
      <Suspense fallback={<Loader />}>
        <MaintenanceMode />
      </Suspense>
    );

  return <>{children}</>;
};

export default MaintenanceMiddleware;
