import Welcome from "./welcome";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Welcome",
  component: Welcome,
  parameters: {
    name: {
      name: "Name",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Mr Spock"
  }
};
