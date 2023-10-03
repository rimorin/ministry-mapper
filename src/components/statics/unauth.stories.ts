import UnauthorizedPage from "./unauth";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Unauthorized Page",
  component: UnauthorizedPage,
  parameters: {
    handleClick: {
      type: "function"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Nebula",
    handleClick: () => {
      return;
    }
  }
};
