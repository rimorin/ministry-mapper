import { FC, ReactNode, useState } from "react";
import { StateContext } from "../utils/context";

interface StateMiddlewareProps {
  children: ReactNode;
}

const StateMiddleware: FC<StateMiddlewareProps> = ({ children }) => {
  const [frontPageMode, setFrontPageMode] = useState<
    "login" | "signup" | "forgot"
  >("login");

  return (
    <StateContext.Provider value={{ frontPageMode, setFrontPageMode }}>
      {children}
    </StateContext.Provider>
  );
};

export default StateMiddleware;
