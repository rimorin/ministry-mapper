import { memo } from "react";
import ZeroPad from "../../utils/helpers/zeropad";
import { tableHeaderProp } from "../../utils/interface";

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

export default TableHeader;
