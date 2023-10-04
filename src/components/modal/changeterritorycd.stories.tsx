import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import ChangeTerritoryCode from "./changeterritorycd";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { userEvent, within } from "@storybook/testing-library";
import { Button } from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";
import ModalManager from "@ebay/nice-modal-react";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Territory Code",
  component: ChangeTerritoryCode
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    congregation: "test",
    territoryCode: "M01"
  },
  render: ({ footerSaveAcl, congregation, territoryCode }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangeTerritoryCode, {
              footerSaveAcl,
              congregation,
              territoryCode
            });
          }}
        >
          Test changeterritorycd
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Change Territory Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("Existing Territory Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("New Territory Code")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
