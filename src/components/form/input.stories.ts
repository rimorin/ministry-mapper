import GenericInputField from "./input";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Input",
  component: GenericInputField,
  parameters: {
    handleChange: {
      action: "changed",
      type: "function"
    },
    changeValue: {
      defaultValue: "Nebula",
      type: "string"
    },
    name: {
      defaultValue: "Name",
      type: "string"
    },
    label: {
      defaultValue: "Name",
      type: "string"
    },
    required: {
      defaultValue: false,
      type: "boolean"
    },
    placeholder: {
      defaultValue: "Enter your name",
      type: "string"
    },
    information: {
      defaultValue: "Enter your name",
      type: "string"
    },
    inputType: {
      defaultValue: "string",
      type: "string"
    },
    readOnly: {
      defaultValue: false,
      type: "boolean"
    },
    focus: {
      defaultValue: false,
      type: "boolean"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PlainInput: Story = {
  args: {
    handleChange: () => {
      return;
    }
  }
};

export const InputWithLabel: Story = {
  args: {
    handleChange: () => {
      return;
    },
    label: "Name"
  }
};

export const InputWithPlaceholder: Story = {
  args: {
    handleChange: () => {
      return;
    },
    placeholder: "Enter your name"
  }
};

export const InputWithInformation: Story = {
  args: {
    handleChange: () => {
      return;
    },
    information: "Name as per ID"
  }
};

export const ReadOnlyInput: Story = {
  args: {
    handleChange: () => {
      return;
    },
    readOnly: true,
    changeValue: "Nebula"
  }
};

export const AutofocusInput: Story = {
  args: {
    handleChange: () => {
      return;
    },
    focus: true
  }
};

export const NumberOnlyInput: Story = {
  args: {
    handleChange: () => {
      return;
    },
    inputType: "number",
    changeValue: 0
  }
};
