import NavBarBranding from "./branding";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Branding",
  component: NavBarBranding,
  parameters: {
    naming: {
      defaultValue: "Branding",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    naming: "Branding"
  }
};

export const CustomName: Story = {
  args: {
    naming: "Woodlands Nebula"
  }
};

export const EmptyName: Story = {
  args: {
    naming: ""
  }
};
