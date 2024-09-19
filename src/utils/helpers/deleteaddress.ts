import { ref, remove } from "firebase/database";
import pollingVoidFunction from "./pollingvoid";
import { database } from "../../firebase";

const deleteAddress = async (congregationCode: string, addressCode: string) => {
  await pollingVoidFunction(() =>
    remove(ref(database, `addresses/${congregationCode}/${addressCode}`))
  );
};

export default deleteAddress;
