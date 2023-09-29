import { TERRITORY_TYPES } from "../../utils/constants";
import { territoryTableProps } from "../../utils/interface";
import PublicTerritoryTable from "./publictable";
import PrivateTerritoryTable from "./privatetable";

const PublisherTerritoryTable = ({
  postalCode,
  floors,
  maxUnitNumberLength,
  completedPercent,
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
        completedPercent={completedPercent}
        handleHouseUpdate={handleUnitStatusUpdate}
      />
    );
  }
  return (
    <PublicTerritoryTable
      postalCode={postalCode}
      floors={floors}
      maxUnitNumberLength={maxUnitNumberLength}
      completedPercent={completedPercent}
      handleUnitStatusUpdate={handleUnitStatusUpdate}
      policy={policy}
    />
  );
};

export default PublisherTerritoryTable;
