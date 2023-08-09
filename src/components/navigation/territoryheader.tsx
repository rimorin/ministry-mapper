import { memo } from "react";
import { Container } from "react-bootstrap";
import { territoryHeaderProp } from "../../utils/interface";

const TerritoryHeader = memo(({ name }: territoryHeaderProp) => {
  if (!name) return <></>;
  return (
    <Container
      fluid
      className="text-center bg-light py-2 fw-bolder text-success border-top"
    >
      {name}
    </Container>
  );
});

export default TerritoryHeader;
