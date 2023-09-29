import Legend from "./legend";
import { Meta, StoryObj } from "@storybook/react";
const meta: Meta = {
  title: "Navigation/Legend",
  component: Legend,
  parameters: {
    showLegend: {
      defaultValue: true,
      type: "boolean"
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showLegend: true
  }
};
