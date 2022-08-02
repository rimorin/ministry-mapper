import { floorDetails } from "./interface";

interface tableProp {
  name: String;
  postalcode: String;
  floors: Array<floorDetails>;
}

function TableHeader({ name, postalcode, floors }: tableProp) {
  return (
    <>
      <caption>
        <a
          href={`http://maps.google.com.sg/maps?q=${postalcode}`}
          target="blank"
        >
          {name}, {postalcode}
        </a>
      </caption>
      <thead>
        <tr>
          <th scope="col" className="text-center">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => (
              <th
                key={`${index}-${item.number}`}
                scope="col"
                className="text-center"
              >
                {item.number}
              </th>
            ))}
        </tr>
      </thead>
    </>
  );
}

export default TableHeader;
