import { USER_ACCESS_LEVELS } from "../../utils/constants";
import ComponentAuthorizer from "./authorizer";
import { Meta, StoryObj } from "@storybook/react";

const CHILDREN_VALUE = "You can see me";

const meta: Meta = {
  title: "Navigation/Authorizer",
  component: ComponentAuthorizer,
  parameters: {
    requiredPermission: {
      defaultValue: 0,
      type: "number"
    },
    userPermission: { defaultValue: 0, type: "number" },
    children: { defaultValue: CHILDREN_VALUE, type: "string" }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    userPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    children: CHILDREN_VALUE
  }
};

export const ReadOnlyUserAccessingAdminLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    userPermission: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    children: CHILDREN_VALUE
  }
};

export const ReadOnlyUserAccessingConductorLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    userPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    children: CHILDREN_VALUE
  }
};

export const ReadOnlyUserAccessingReadOnlyLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    userPermission: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    children: CHILDREN_VALUE
  }
};

export const ConductorUserAccessingAdminLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    userPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    children: CHILDREN_VALUE
  }
};

export const ConductorUserAccessingConductorLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    userPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    children: CHILDREN_VALUE
  }
};

export const ConductorUserAccessingReadOnlyLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    userPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    children: CHILDREN_VALUE
  }
};

export const AdminUserAccessingAdminLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    userPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    children: CHILDREN_VALUE
  }
};

export const AdminUserAccessingConductorLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    userPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    children: CHILDREN_VALUE
  }
};

export const AdminUserAccessingReadOnlyLevelComponent: Story = {
  args: {
    requiredPermission: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    userPermission: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    children: CHILDREN_VALUE
  }
};
