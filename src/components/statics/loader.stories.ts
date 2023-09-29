import Loader from "./loader";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Loader",
  component: Loader
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
