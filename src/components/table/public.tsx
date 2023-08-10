import { Table } from "react-bootstrap";
import { territoryTableProps } from "../../utils/interface";
// import { TableHeader, FloorHeader, UnitStatus } from "../table";
import TableHeader from "../table/header";
import FloorHeader from "../table/floor";
import UnitStatus from "../table/unit";
const PublicTerritoryTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  completedPercent,
  policy,
  trackRace,
  trackLanguages,
  handleUnitStatusUpdate
}: territoryTableProps) => (
  <div className="sticky-body">
    <Table
      bordered
      striped
      hover
      className="sticky-table"
      key={`table-${postalCode}`}
    >
      <TableHeader floors={floors} maxUnitNumber={maxUnitNumberLength} />
      <tbody>
        {floors &&
          floors.map((item, index) => (
            <tr key={`row-${index}`}>
              <FloorHeader index={index} floor={item.floor} />
              {item.units.map((element) => (
                <td
                  className={`text-center align-middle inline-cell ${policy?.getUnitColor(
                    element,
                    completedPercent.completedValue
                  )}`}
                  onClick={handleUnitStatusUpdate}
                  data-floor={item.floor}
                  data-unitno={element.number}
                  key={`${item.floor}-${element.number}`}
                >
                  <UnitStatus
                    type={element.type}
                    note={element.note}
                    status={element.status}
                    nhcount={element.nhcount}
                    languages={element.languages}
                    trackRace={trackRace}
                    trackLanguages={trackLanguages}
                  />
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  </div>
);

export default PublicTerritoryTable;
