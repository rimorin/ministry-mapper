import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import ConfirmSlipDetails from "./slipdetails";

const meta: Meta = {
  title: "Administrator/Confirm Slip Details",
  component: ConfirmSlipDetails
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    congregation: "test",
    postalCode: "test",
    addressName: "test",
    userAccessLevel: 1,
    isPersonalSlip: true
  },
  render: ({
    congregation,
    postalCode,
    addressName,
    userAccessLevel,
    isPersonalSlip
  }) => (
    <NiceModal.Provider>
      <Button
        variant="outline-primary"
        onClick={() => {
          ModalManager.show(ConfirmSlipDetails, {
            congregation,
            postalCode,
            addressName,
            userAccessLevel,
            isPersonalSlip
          });
        }}
      >
        Test confirm slip details
      </Button>
    </NiceModal.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Confirm personal slip details for test")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Publishers Name")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
