import { Meta, StoryObj } from "@storybook/react";
import UserRoleField from "./role";
import { USER_ACCESS_LEVELS } from "../../utils/constants";

const meta: Meta = {
  title: "Form/User Role Field",
  component: UserRoleField,
  parameters: {
    role: {
      defaultValue: USER_ACCESS_LEVELS.NO_ACCESS.CODE,
      type: "number"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoAccess: Story = {
  args: {
    role: USER_ACCESS_LEVELS.NO_ACCESS.CODE
  }
};

export const ReadOnly: Story = {
  args: {
    role: USER_ACCESS_LEVELS.READ_ONLY.CODE
  }
};

export const Conductor: Story = {
  args: {
    role: USER_ACCESS_LEVELS.CONDUCTOR.CODE
  }
};

export const TerritoryServant: Story = {
  args: {
    role: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
  }
};
