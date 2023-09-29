import MaintenanceMode from "./maintenance";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Maintenance Mode",
  component: MaintenanceMode
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
