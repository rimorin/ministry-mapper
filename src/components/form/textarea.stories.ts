import GenericTextAreaField from "./textarea";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Form/Text Area Field",
  component: GenericTextAreaField,
  parameters: {
    handleChange: {
      type: "function"
    },
    changeValue: {
      type: "string"
    },
    label: {
      type: "string"
    },
    name: {
      type: "string"
    },
    placeholder: {
      type: "string"
    },
    rows: {
      defaultValue: 3,
      type: "number"
    },
    required: {
      defaultValue: false,
      type: "boolean"
    },
    readOnly: {
      defaultValue: false,
      type: "boolean"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "",
    label: "Text Area Field",
    name: "TextAreaField",
    placeholder: "Enter text here"
  }
};

export const EmptyLabel: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "This is a text area field",
    label: "",
    name: "TextAreaField",
    placeholder: "Enter text here"
  }
};

export const EmptyPlaceholder: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "",
    label: "Text Area Field",
    name: "TextAreaField",
    placeholder: ""
  }
};

export const EmptyLabelAndPlaceholder: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "",
    label: "",
    name: "TextAreaField",
    placeholder: ""
  }
};

export const FiveRows: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "",
    label: "Text Area Field",
    name: "TextAreaField",
    placeholder: "Enter text here",
    rows: 5
  }
};

export const ReadOnly: Story = {
  args: {
    handleChange: () => {
      return;
    },
    changeValue: "",
    label: "Text Area Field",
    name: "TextAreaField",
    placeholder: "Enter text here",
    readOnly: true
  }
};
