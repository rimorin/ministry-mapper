import UseAnotherButton from "./useanother";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Use Another Button",
  component: UseAnotherButton
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleClick: () => {
      return;
    }
  }
};

export const ClickWithFunction: Story = {
  args: {
    handleClick: () => {
      return;
    }
  }
};
