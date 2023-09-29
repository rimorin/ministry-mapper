import { MAX_TOP_FLOOR } from "../../utils/constants";
import FloorField from "./floors";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Floor Slider",
  component: FloorField
};

export default meta;

type Story = StoryObj<typeof meta>;

export const OneFloor: Story = {
  args: {
    changeValue: 1
  }
};

export const MiddleFloor: Story = {
  args: {
    changeValue: (MAX_TOP_FLOOR / 2).toFixed(0)
  }
};

export const TopFloor: Story = {
  args: {
    changeValue: MAX_TOP_FLOOR
  }
};
