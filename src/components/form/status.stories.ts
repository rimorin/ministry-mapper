import { STATUS_CODES } from "../../utils/constants";
import { Meta, StoryObj } from "@storybook/react";
import HHStatusField from "./status";

const meta: Meta = {
  title: "Form/Householder Status Field",
  component: HHStatusField,
  parameters: {
    changeValue: {
      defaultValue: STATUS_CODES.DEFAULT,
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NotDone: Story = {
  args: {
    changeValue: STATUS_CODES.DEFAULT
  }
};

export const Done: Story = {
  args: {
    changeValue: STATUS_CODES.DONE
  }
};

export const NotHome: Story = {
  args: {
    changeValue: STATUS_CODES.NOT_HOME
  }
};

export const DNC: Story = {
  args: {
    changeValue: STATUS_CODES.DO_NOT_CALL
  }
};

export const Invalid: Story = {
  args: {
    changeValue: STATUS_CODES.INVALID
  }
};
