import BackToTop from "./backtotop";

import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Back To Top Button",
  component: BackToTop,
  parameters: {
    showButton: {
      defaultValue: true,
      type: "boolean"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showButton: true
  }
};

export const HideButton: Story = {
  args: {
    showButton: false
  }
};
