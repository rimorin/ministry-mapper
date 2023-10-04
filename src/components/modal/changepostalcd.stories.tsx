import { StoryObj, Meta } from "@storybook/react";
import { Button } from "react-bootstrap";
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import NiceModal from "@ebay/nice-modal-react";
import ModalManager from "@ebay/nice-modal-react";
import ChangeAddressPostalCode from "./changepostalcd";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Address Postal Code",
  component: ChangeAddressPostalCode
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation: "test",
    territoryCode: "test",
    postalCode: "test"
  },
  render: ({ footerSaveAcl, congregation, territoryCode, postalCode }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangeAddressPostalCode, {
              footerSaveAcl,
              congregation,
              territoryCode,
              postalCode
            });
          }}
        >
          Test changepostalcd
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Change Address Postal Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("Existing Postal Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("New Postal Code")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
