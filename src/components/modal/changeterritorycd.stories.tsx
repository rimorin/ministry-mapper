import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import ChangeTerritoryCode from "./changeterritorycd";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { within } from "@storybook/testing-library";
import NiceModal from "@ebay/nice-modal-react";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Territory Code",
  component: ChangeTerritoryCode,
  decorators: [
    (storyFn) => (
      <div style={{ width: "1200px", height: "800px" }}>{storyFn()}</div>
    )
  ]
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
        <ChangeTerritoryCode
          id="1"
          defaultVisible
          footerSaveAcl={footerSaveAcl}
          congregation={congregation}
          territoryCode={territoryCode}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Change Territory Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("Existing Territory Code")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText("New Territory Code")
    ).toBeInTheDocument();
  }
};
