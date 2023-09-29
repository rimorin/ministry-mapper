import { NOT_HOME_STATUS_CODES } from "../../utils/constants";
import HHNotHomeField from "./nothome";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Not Home Field",
  component: HHNotHomeField,
  parameters: {
    changeValue: {
      defaultValue: 0,
      type: "number"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstTry: Story = {
  args: {
    changeValue: NOT_HOME_STATUS_CODES.DEFAULT
  }
};

export const SecondTry: Story = {
  args: {
    changeValue: NOT_HOME_STATUS_CODES.SECOND_TRY
  }
};

export const ThirdTry: Story = {
  args: {
    changeValue: NOT_HOME_STATUS_CODES.THIRD_TRY
  }
};

export const FourthTry: Story = {
  args: {
    changeValue: NOT_HOME_STATUS_CODES.FOURTH_TRY
  }
};
