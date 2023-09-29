import TerritoryHeader from "./territoryheader";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Territory Header",
  component: TerritoryHeader,
  parameters: {
    name: {
      name: "Territory Header",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Nebula Congregation"
  }
};

export const EmptyName: Story = {
  args: {
    name: ""
  }
};
