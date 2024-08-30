import { memo } from "react";
import { Badge } from "react-bootstrap";
import { aggregateBadgeProp } from "../../utils/interface";

const AggregationBadge = memo(
  ({ aggregate = 0, width = "2.5rem" }: aggregateBadgeProp) => {
    let badgeStyle = "";
    let statusColor = "success";
    if (aggregate > 70 && aggregate <= 90) {
      statusColor = "warning";
      badgeStyle = "aggregate-dark-text";
    }
    if (aggregate > 90) statusColor = "danger";
    return (
      <span style={{ margin: "0 0.25rem" }}>
        <Badge
          pill
          bg={statusColor}
          className={badgeStyle}
          style={{ width: width }}
        >
          {aggregate}%
        </Badge>
      </span>
    );
  }
);

export default AggregationBadge;
