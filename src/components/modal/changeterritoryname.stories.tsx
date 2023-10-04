import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import ChangeTerritoryName from "./changeterritoryname";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/ChangeTerritoryName",
  component: ChangeTerritoryName
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Test Territory Name",
    footerSaveAcl: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation: "testcongregation",
    territoryCode: "testterritorycode"
  },
  argTypes: {
    name: {
      control: {
        type: "text"
      }
    },
    footerSaveAcl: {
      control: {
        type: "number"
      }
    },
    congregation: {
      control: {
        type: "text"
      }
    },
    territoryCode: {
      control: {
        type: "text"
      }
    }
  },
  render: ({ name, footerSaveAcl, congregation, territoryCode }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(ChangeTerritoryName, {
              name,
              footerSaveAcl,
              congregation,
              territoryCode
            });
          }}
        >
          Test ChangeTerritoryName
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Change Territory Name")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
