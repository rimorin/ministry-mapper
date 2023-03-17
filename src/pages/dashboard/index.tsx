import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Admin from "./admin";
import Login from "../login";
import { Loader, VerificationPage } from "../../components/static";
import { User } from "firebase/auth";
import { useParams } from "react-router-dom";
import { useRollbar } from "@rollbar/react";

function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState<User>();
  const rollbar = useRollbar();
  const { code } = useParams();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setLoginUser(user || undefined);
      setIsLoading(false);
    });
  }, []);
  if (isLoading) return <Loader />;
  if (loginUser && !loginUser.emailVerified) {
    rollbar.info(
      `Unverified user attempting to access ${code}! Email: ${loginUser.email}, Name: ${loginUser.displayName}`
    );
    return <VerificationPage />;
  }
  return loginUser ? <Admin user={loginUser} /> : <Login />;
}

export default Dashboard;
