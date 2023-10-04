import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import NewTerritoryCode from "./newterritorycd";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Territory Code",
  component: NewTerritoryCode
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: 1,
    congregation: "testcongregation"
  },
  render: ({ footerSaveAcl, congregation }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(NewTerritoryCode, {
              footerSaveAcl,
              congregation
            });
          }}
        >
          Test newterritorycd
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Create New Territory")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Territory Code")
    ).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Name")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
