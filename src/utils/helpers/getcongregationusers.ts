import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { CLOUD_FUNCTIONS_CALLS } from "../constants";
import { userDetails } from "../interface";

const getCongregationUsers = async (
  code: string
): Promise<Map<string, userDetails>> => {
  const getCongregationUsersCallable = httpsCallable(
    functions,
    `${import.meta.env.VITE_SYSTEM_ENVIRONMENT}-${CLOUD_FUNCTIONS_CALLS.GET_CONGREGATION_USERS}`
  );

  const result = (await getCongregationUsersCallable({
    congregation: code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;

  if (Object.keys(result.data).length === 0) {
    throw new Error("There are no users to manage.");
  }

  const userListing = new Map<string, userDetails>();
  for (const key in result.data) {
    const data = result.data[key];
    userListing.set(key, {
      uid: key,
      name: data.name,
      verified: data.verified,
      email: data.email,
      role: data.role
    });
  }

  return userListing;
};

export default getCongregationUsers;
