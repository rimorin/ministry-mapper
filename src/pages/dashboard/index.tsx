import { useState, useEffect, lazy, Suspense } from "react";
import { auth } from "../../firebase";
import Loader from "../../components/statics/loader";
import { sendEmailVerification, signOut, User } from "firebase/auth";
import { useParams } from "react-router-dom";
import { useRollbar } from "@rollbar/react";
const Login = lazy(() => import("../login"));
const Admin = lazy(() => import("./admin"));
const VerificationPage = lazy(
  () => import("../../components/navigation/verification")
);

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
    return (
      <Suspense fallback={<Loader />}>
        <VerificationPage
          handleResendMail={() => {
            sendEmailVerification(loginUser).then(() =>
              alert(
                "Resent verification email! Please check your inbox or spam folder."
              )
            );
          }}
          handleClick={() => signOut(auth)}
          name={`${loginUser.displayName}`}
        />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<Loader />}>
      {loginUser ? <Admin user={loginUser} /> : <Login />}
    </Suspense>
  );
}

export default Dashboard;
