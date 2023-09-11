import { memo } from "react";
import { Badge } from "react-bootstrap";
import { USER_ACCESS_LEVELS } from "../../utils/constants";

const UserRoleBadge = memo(({ role }: { role: number | undefined }) => {
  if (!role) return <></>;

  switch (role) {
    case USER_ACCESS_LEVELS.READ_ONLY.CODE:
      return (
        <Badge bg="secondary">
          {USER_ACCESS_LEVELS.READ_ONLY.SHORT_DISPLAY}
        </Badge>
      );
    case USER_ACCESS_LEVELS.CONDUCTOR.CODE:
      return (
        <Badge bg="success">{USER_ACCESS_LEVELS.CONDUCTOR.SHORT_DISPLAY}</Badge>
      );
    case USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE:
      return (
        <Badge bg="primary">
          {USER_ACCESS_LEVELS.TERRITORY_SERVANT.SHORT_DISPLAY}
        </Badge>
      );
    default:
      return <></>;
  }
});

export default UserRoleBadge;