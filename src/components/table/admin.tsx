import { Table, Button } from "react-bootstrap";
import {
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS,
  DEFAULT_FLOOR_PADDING,
  DEFAULT_UNIT_DNC_MS_TIME,
  DEFAULT_AGGREGATES
} from "../../utils/constants";
import ZeroPad from "../../utils/helpers/zeropad";
import { territoryTableProps } from "../../utils/interface";
import ComponentAuthorizer from "../navigation/authorizer";
import UnitStatus from "./unit";
import PrivateTerritoryTable from "./privatetable";

const AdminTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  aggregates,
  policy,
  adminUnitHeaderStyle,
  handleUnitNoUpdate,
  handleUnitStatusUpdate,
  handleFloorDelete,
  userAccessLevel,
  territoryType
}: territoryTableProps) => {
  if (territoryType === TERRITORY_TYPES.PRIVATE) {
    return (
      <PrivateTerritoryTable
        isAdmin={true}
        postalCode={postalCode}
        houses={floors[0]}
        aggregates={aggregates}
        handleHouseUpdate={handleUnitStatusUpdate}
        policy={policy}
      />
    );
  }
  return (
    <Table
      key={`table-${postalCode}`}
      bordered
      striped
      hover
      responsive="sm"
      className="sticky-table"
    >
      <thead>
        <tr className="inline-row">
          <th scope="col" className="text-center align-middle sticky-left-cell">
            lvl/unit
          </th>
          {floors &&
            floors[0].units.map((item, index) => {
              return (
                <th
                  key={`${index}-${item.number}`}
                  scope="col"
                  className={`${adminUnitHeaderStyle}text-center align-middle`}
                  onClick={handleUnitNoUpdate}
                  data-length={floors[0].units.length}
                  data-sequence={item.sequence}
                  data-unitno={item.number}
                >
                  {ZeroPad(item.number, maxUnitNumberLength)}
                </th>
              );
            })}
        </tr>
      </thead>
      <tbody key={`tbody-${postalCode}`}>
        {floors &&
          floors.map((floorElement, floorIndex) => (
            <tr key={`row-${floorIndex}`} className="inline-row">
              <th
                className="text-center align-middle inline-cell sticky-left-cell"
                key={`floor-${floorIndex}`}
                scope="row"
              >
                <ComponentAuthorizer
                  requiredPermission={USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE}
                  userPermission={userAccessLevel}
                >
                  <Button
                    size="sm"
                    variant="outline-warning"
                    className="me-1"
                    onClick={handleFloorDelete}
                    data-floor={floorElement.floor}
                  >
                    🗑️
                  </Button>
                </ComponentAuthorizer>
                {`${ZeroPad(floorElement.floor, DEFAULT_FLOOR_PADDING)}`}
              </th>
              {floorElement.units.map((detailsElement, index) => (
                <td
                  className={`text-center align-middle inline-cell ${policy?.getUnitColor(
                    detailsElement,
                    aggregates?.value || DEFAULT_AGGREGATES.value
                  )}`}
                  onClick={handleUnitStatusUpdate}
                  key={`${index}-${detailsElement.number}`}
                  data-floor={floorElement.floor}
                  data-unitno={detailsElement.number}
                  data-hhtype={detailsElement.type}
                  data-hhnote={detailsElement.note}
                  data-hhstatus={detailsElement.status}
                  data-nhcount={detailsElement.nhcount}
                  data-dnctime={
                    detailsElement.dnctime || DEFAULT_UNIT_DNC_MS_TIME
                  }
                >
                  <UnitStatus
                    key={`unit-${index}-${detailsElement.number}`}
                    type={detailsElement.type}
                    note={detailsElement.note}
                    status={detailsElement.status}
                    nhcount={detailsElement.nhcount}
                    defaultOption={policy?.defaultType}
                  />
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default AdminTable;
