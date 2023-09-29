import NotFoundPage from "./notfound";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Statics/Not Found Page",
  component: NotFoundPage
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
