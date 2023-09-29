import { USER_ACCESS_LEVELS } from "../../utils/constants";
import UserRoleBadge from "./rolebadge";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/User Role Badge",
  component: UserRoleBadge,
  parameters: {
    role: {
      defaultValue: USER_ACCESS_LEVELS.NO_ACCESS.CODE,
      type: "number"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
