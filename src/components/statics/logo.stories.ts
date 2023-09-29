import FrontLogo from "./logo";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Logo",
  component: FrontLogo
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
