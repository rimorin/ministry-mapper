import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import NewUnit from "./newunit";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Unit",
  component: NewUnit
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: 1,
    postalCode: "test",
    addressData: "test",
    defaultType: "test"
  },
  render: ({ footerSaveAcl, postalCode, addressData, defaultType }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(NewUnit, {
              footerSaveAcl,
              postalCode,
              addressData,
              defaultType
            });
          }}
        >
          Test newunit
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Add unit to test")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Unit number")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
