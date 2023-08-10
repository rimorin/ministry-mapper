import { memo } from "react";
import { Badge, Spinner } from "react-bootstrap";
import { aggregateProp } from "../../utils/interface";

const AggregationBadge = memo(
  ({ aggregate = 0, isDataFetched }: aggregateProp) => {
    let badgeStyle = "";
    let statusColor = "success";
    if (aggregate > 70 && aggregate <= 90) {
      statusColor = "warning";
      badgeStyle = "aggregate-dark-text";
    }
    if (aggregate > 90) statusColor = "danger";
    return (
      <span style={{ marginRight: "0.25rem" }}>
        {isDataFetched ? (
          <Badge pill bg={statusColor} className={badgeStyle}>
            {aggregate}%
          </Badge>
        ) : (
          <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
        )}
      </span>
    );
  }
);

export default AggregationBadge;
