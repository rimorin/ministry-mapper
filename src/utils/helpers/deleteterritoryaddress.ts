import {
  ref,
  query,
  orderByValue,
  equalTo,
  limitToFirst,
  get,
  remove
} from "firebase/database";
import pollingQueryFunction from "./pollingquery";
import pollingVoidFunction from "./pollingvoid";
import { database } from "../../firebase";

const deleteTerritoryAddress = async (
  congregationCode: string,
  territoryCode: string,
  addressCode: string
) => {
  const addressesRef = ref(
    database,
    `congregations/${congregationCode}/territories/${territoryCode}/addresses`
  );
  const addressCodeQuery = query(
    addressesRef,
    orderByValue(),
    equalTo(addressCode),
    limitToFirst(1)
  );

  const snapshot = await pollingQueryFunction(() => get(addressCodeQuery));
  if (!snapshot.exists()) return;
  const addressKey = Object.keys(snapshot.val())[0];
  await pollingVoidFunction(() =>
    remove(
      ref(
        database,
        `congregations/${congregationCode}/territories/${territoryCode}/addresses/${addressKey}`
      )
    )
  );
};

export default deleteTerritoryAddress;
