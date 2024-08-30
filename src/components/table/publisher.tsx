import { TERRITORY_TYPES } from "../../utils/constants";
import { territoryTableProps } from "../../utils/interface";
import PublicTerritoryTable from "./publictable";
import PrivateTerritoryTable from "./privatetable";

const PublisherTerritoryTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  aggregates,
  policy: policy,
  territoryType,
  handleUnitStatusUpdate
}: territoryTableProps) => {
  if (territoryType === TERRITORY_TYPES.PRIVATE) {
    return (
      <PrivateTerritoryTable
        isAdmin={false}
        postalCode={postalCode}
        houses={floors[0]}
        policy={policy}
        aggregates={aggregates}
        handleHouseUpdate={handleUnitStatusUpdate}
      />
    );
  }
  return (
    <PublicTerritoryTable
      postalCode={postalCode}
      floors={floors}
      maxUnitNumberLength={maxUnitNumberLength}
      aggregates={aggregates}
      handleUnitStatusUpdate={handleUnitStatusUpdate}
      policy={policy}
    />
  );
};

export default PublisherTerritoryTable;
