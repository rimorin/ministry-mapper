import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import NewPrivateAddress from "./newprivateadd";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Private Address",
  component: NewPrivateAddress
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: 1,
    congregation: "testcongregation",
    territoryCode: "testterritorycode",
    defaultType: "testdefaulttype"
  },
  render: ({ footerSaveAcl, congregation, territoryCode, defaultType }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(NewPrivateAddress, {
              footerSaveAcl,
              congregation,
              territoryCode,
              defaultType
            });
          }}
        >
          Test newprivateadd
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Create Private Address")
    ).toBeInTheDocument();
    await expect(await canvas.findByText("Postal Code")).toBeInTheDocument();
    await expect(await canvas.findByText("Address Name")).toBeInTheDocument();
    await expect(await canvas.findByText("House Sequence")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
