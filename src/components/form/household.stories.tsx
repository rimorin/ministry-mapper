import { StoryObj, Meta } from "@storybook/react";
import HouseholdField from "./household";

const meta: Meta = {
  title: "Form/Household Options",
  component: HouseholdField
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  args: {
    changeValue: "",
    options: [
      {
        value: "1",
        label: "Human"
      },
      {
        value: "2",
        label: "Klingon"
      },
      {
        value: "3",
        label: "Vulcan"
      },
      {
        value: "4",
        label: "Romulan"
      }
    ]
  }
};

export const ExistingValueSelected: Story = {
  args: {
    changeValue: "1",
    options: [
      {
        value: "1",
        label: "Human"
      },
      {
        value: "2",
        label: "Klingon"
      },
      {
        value: "3",
        label: "Vulcan"
      },
      {
        value: "4",
        label: "Romulan"
      }
    ]
  }
};
