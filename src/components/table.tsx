import { memo } from "react";
import { floorDetails } from "./interface";
import { DEFAULT_FLOOR_PADDING, ZeroPad } from "./util";

interface floorHeaderProp {
  floor: String;
  index: number;
}

interface tableHeaderProp {
  floors: Array<floorDetails>;
  maxUnitNumber: number;
}

const TableHeader = memo(({ floors, maxUnitNumber = 2 }: tableHeaderProp) => {
  return (
    <>
      <thead className="sticky-top-cell">
        <tr>
          <th scope="col" className="text-center align-middle sticky-left-cell">
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
});

const FloorHeader = memo(({ index, floor }: floorHeaderProp) => (
  <th
    className="sticky-left-cell text-center align-middle"
    key={`${index}-${floor}`}
    scope="row"
  >
    {ZeroPad(floor, DEFAULT_FLOOR_PADDING)}
  </th>
));

export { TableHeader, FloorHeader };
