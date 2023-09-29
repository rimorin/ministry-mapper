import { StoryObj, Meta } from "@storybook/react";
import ModalSubmitButton from "./submit";

const meta: Meta = {
  component: ModalSubmitButton,
  title: "Modal/Submit Button"
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isSaving: false,
    btnLabel: "Save",
    disabled: false
  }
};

export const Saving: Story = {
  args: {
    isSaving: true,
    btnLabel: "Save",
    disabled: false
  }
};

export const Disabled: Story = {
  args: {
    isSaving: false,
    btnLabel: "Save",
    disabled: true
  }
};
