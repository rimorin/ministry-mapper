import { ref, update, increment } from "firebase/database";
import { database } from "../../firebase";
import pollingVoidFunction from "./pollingvoid";

async function updateAddressDelta(congregation: string, addressCode: string) {
  await pollingVoidFunction(() =>
    update(ref(database, `addresses/${congregation}/${addressCode}`), {
      delta: increment(1)
    })
  );
}

export default updateAddressDelta;
