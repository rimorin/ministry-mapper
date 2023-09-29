import NotHomeIcon from "./nothome";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Not Home",
  component: NotHomeIcon,
  parameters: {
    nhcount: {
      defaultValue: 0,
      type: "number"
    },
    classProp: {
      defaultValue: "",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nhcount: 1,
    classProp: ""
  }
};

export const CustomCount: Story = {
  args: {
    nhcount: 5,
    classProp: ""
  }
};
