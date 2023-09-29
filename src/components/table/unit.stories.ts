import { NOT_HOME_STATUS_CODES, STATUS_CODES } from "../../utils/constants";
import UnitStatus from "./unit";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Unit Status",
  component: UnitStatus
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "cn",
    status: 0,
    note: "This is a note",
    nhcount: 0,
    defaultOption: ""
  }
};

export const Invalid: Story = {
  args: {
    type: "",
    status: STATUS_CODES.INVALID,
    note: "This is a note",
    nhcount: 0,
    defaultOption: ""
  }
};

export const Done: Story = {
  args: {
    type: "",
    status: STATUS_CODES.DONE,
    note: "",
    nhcount: 0,
    defaultOption: ""
  }
};

export const DoNotCall: Story = {
  args: {
    type: "",
    status: STATUS_CODES.DO_NOT_CALL,
    note: "",
    nhcount: 0,
    defaultOption: ""
  }
};

export const NotHome: Story = {
  args: {
    type: "",
    status: STATUS_CODES.NOT_HOME,
    note: "",
    nhcount: 1,
    defaultOption: ""
  }
};

export const NotHomeSecondTry: Story = {
  args: {
    type: "",
    status: STATUS_CODES.NOT_HOME,
    note: "",
    nhcount: NOT_HOME_STATUS_CODES.SECOND_TRY,
    defaultOption: ""
  }
};

export const Note: Story = {
  args: {
    type: "cn",
    status: 0,
    note: "This is a note",
    nhcount: 0,
    defaultOption: ""
  }
};
