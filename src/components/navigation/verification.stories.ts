import VerificationPage from "./verification";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Verification Page",
  component: VerificationPage,
  parameters: {
    name: {
      name: "Name",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Nebula",
    handleClick: () => {
      return;
    },
    handleResendMail: () => {
      return;
    }
  }
};
