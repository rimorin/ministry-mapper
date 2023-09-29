import InvalidPage from "./invalidpage";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Invalid Page",
  component: InvalidPage
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
