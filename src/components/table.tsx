import { floorDetails } from "./interface";
import { ZeroPad } from "./util";

interface tableHeaderProp {
  floors: Array<floorDetails>;
  maxUnitNumber: number;
}

function TableHeader({ floors, maxUnitNumber = 2 }: tableHeaderProp) {
  return (
    <>
      <thead
        style={{
          position: "sticky",
          top: 0,
          margin: "0 0 0 0",
          backgroundColor: "white"
        }}
      >
        <tr>
          <th scope="col" className="text-center align-middle">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => (
              <th
                key={`${index}-${item.number}`}
                scope="col"
                className="text-center align-middle"
              >
                {ZeroPad(item.number, maxUnitNumber)}
              </th>
            ))}
        </tr>
      </thead>
    </>
  );
}

export default TableHeader;
