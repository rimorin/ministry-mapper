import EnvironmentIndicator from "./environment";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Environment",
  component: EnvironmentIndicator,
  parameters: {
    environment: {
      defaultValue: "Production",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    environment: "production"
  }
};

export const Staging: Story = {
  args: {
    environment: "staging"
  }
};

export const Local: Story = {
  args: {
    environment: "local"
  }
};
