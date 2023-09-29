import DncDateField from "./dncdate";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Do Not Call Date",
  component: DncDateField
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoDNCDate: Story = {
  args: {
    changeDate: ""
  }
};

// with DNC Date which is one day after current date
export const WithDNCDate: Story = {
  args: {
    changeDate: new Date(Date.now() - 86400000 * 2).toISOString()
  }
};
