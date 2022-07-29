import { child, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import database from "./../firebase";
interface adminProps {
  congregationCode: String;
}

function Admin({ congregationCode }: adminProps) {
  const [name, setName] = useState<String>();

  const congregationReference = child(
    ref(database),
    `congregations/${congregationCode}`
  );

  useEffect(() => {
    onValue(congregationReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(snapshot.val());
        document.title = `${data["name"]}`;
        setName(`${data["name"]}`);
      } else {
        console.log("No data");
      }
    });
  }, []);

  return <>Testing Admin - {name}</>;
}

export default Admin;
