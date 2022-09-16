import { useState, useEffect } from "react";
import { auth } from "../firebase";
import Admin from "./admin";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./login";
import Loader from "./loader";
import { adminProps } from "./interface";

function Dashboard({ isConductor = false, userType = "Admin" }: adminProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState<any>();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setLoginUser(user);
      setIsLoading(false);
    });
  }, []);
  if (isLoading) return <Loader />;
  return loginUser ? (
    <Admin user={loginUser} isConductor={isConductor} />
  ) : (
    <Login loginType={userType} />
  );
}

export default Dashboard;
