import { useState, useEffect } from "react";
import { auth } from "../firebase";
import Admin from "./admin";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./login";
import { adminProps } from "./interface";

function Dashboard({ isConductor = false, userType = "Admin" }: adminProps) {
  const [loginUser, setLoginUser] = useState<any>();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setLoginUser(user);
    });
  }, []);
  return loginUser ? (
    <Admin user={loginUser} isConductor={isConductor} />
  ) : (
    <Login loginType={userType} />
  );
}

export default Dashboard;
