import React from "react";

interface StateType {
  frontPageMode: "login" | "signup" | "forgot";
  setFrontPageMode: React.Dispatch<
    React.SetStateAction<"login" | "signup" | "forgot">
  >;
}

// Create a new context with a default value
const StateContext = React.createContext<StateType>({
  frontPageMode: "login",
  setFrontPageMode: () => {}
});

export { StateContext };
