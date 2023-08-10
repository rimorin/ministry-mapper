import { AuthorizerProp } from "../../utils/interface";

const ComponentAuthorizer = ({
  requiredPermission,
  userPermission,
  children
}: AuthorizerProp) => {
  if (!userPermission) return <></>;
  const isUnAuthorized = userPermission < requiredPermission;
  if (isUnAuthorized) {
    return <></>;
  }
  return children;
};

export default ComponentAuthorizer;
