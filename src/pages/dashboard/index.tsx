import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Admin from "./admin";
import Login from "../login";
import { Loader, VerificationPage } from "../../components/static";
import { User } from "firebase/auth";

function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState<User>();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setLoginUser(user || undefined);
      setIsLoading(false);
    });
  }, []);
  if (isLoading) return <Loader />;
  if (loginUser && !loginUser.emailVerified) return <VerificationPage />;
  return loginUser ? <Admin user={loginUser} /> : <Login />;
}

export default Dashboard;
