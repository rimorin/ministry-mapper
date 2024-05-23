import { FC } from "react";

const VersionDisplay: FC = () => {
  return (
    <div className="fixed-bottom text-muted opacity-25 m-2">
      <>v{import.meta.env.VITE_VERSION}</>
    </div>
  );
};

export default VersionDisplay;
