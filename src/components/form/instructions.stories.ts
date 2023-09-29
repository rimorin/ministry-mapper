import { USER_ACCESS_LEVELS } from "../../utils/constants";
import InstructionsButton from "./instructions";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Instructions Button",
  component: InstructionsButton,
  parameters: {
    instructions: {
      defaultValue: "This is an instruction",
      type: "string"
    },
    userAcl: {
      defaultValue: 0,
      type: "number"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithInstructions: Story = {
  args: {
    instructions: "This is an instruction",
    userAcl: 0
  }
};

export const WithoutInstructions: Story = {
  args: {
    instructions: "",
    userAcl: 0
  }
};

export const AdminWithoutInstructions: Story = {
  args: {
    instructions: "",
    userAcl: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
  }
};

export const AdminWithInstructions: Story = {
  args: {
    instructions: "This is an instruction",
    userAcl: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
  }
};
