import HelpButton from "./help";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Help",
  component: HelpButton,
  parameters: {
    link: {
      defaultValue: "https://www.google.com",
      type: "string"
    },
    isWarningButton: {
      defaultValue: false,
      type: "boolean"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    link: "https://www.google.com",
    isWarningButton: false
  }
};

export const WarningButton: Story = {
  args: {
    link: "https://www.google.com",
    isWarningButton: true
  }
};
