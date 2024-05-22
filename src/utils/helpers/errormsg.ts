import { FirebaseError } from "firebase/app";

const errorMessage = (error: FirebaseError) => {
  const code = error.code;
  if (code === "auth/too-many-requests")
    return "Device has been blocked temporarily. Please try again later.";
  if (code === "auth/user-disabled")
    return "Account disabled. Please contact support.";
  if (code === "auth/web-storage-unsupported")
    return "Your browser does not support web storage. Please enable it and try again";
  if (code === "auth/network-request-failed")
    return "Network error. Please either try again with a stable internet connection or contact support";
  if (code === "auth/user-not-found") return "Invalid user.";
  if (code === "auth/requires-recent-login")
    return "This security sensitive operation requires re-authentication. Please re-login and try again.";
  if (code === "auth/internal-error")
    return "Internal error. Please try again later.";
  if (code === "auth/email-already-exists")
    return "Email already exists. Please use a different email.";

  return "Invalid Credentials";
};

export default errorMessage;
