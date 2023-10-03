import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";

import UpdateAddressInstructions from "./instructions";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Address Instructions",
  component: UpdateAddressInstructions
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    congregation: "test",
    postalCode: "test",
    addressName: "test",
    userAccessLevel: 1,
    instructions: "test",
    userName: "test"
  },
  render: ({
    congregation,
    postalCode,
    addressName,
    userAccessLevel,
    instructions,
    userName
  }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(UpdateAddressInstructions, {
              congregation,
              postalCode,
              addressName,
              userAccessLevel,
              instructions,
              userName
            });
          }}
        >
          Test instructions
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Instructions on test")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
