import { floorDetails } from "./interface";
import { ZeroPad } from "./util";

interface tableProp {
  floors: Array<floorDetails>;
}

function TableHeader({ floors }: tableProp) {
  let maxUnitNumberLength = 1;

  floors[0].units.forEach((element) => {
    const lengthOfUnitNumber = `${element.number}`.length;
    if (maxUnitNumberLength < lengthOfUnitNumber) {
      maxUnitNumberLength = lengthOfUnitNumber;
    }
  });
  return (
    <>
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
                {ZeroPad(item.number, maxUnitNumberLength)}
              </th>
            ))}
        </tr>
      </thead>
    </>
  );
}

export default TableHeader;
