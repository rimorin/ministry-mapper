import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import ChangeTerritoryName from "./changeterritoryname";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/ChangeTerritoryName",
  component: ChangeTerritoryName,
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
        <ChangeTerritoryName
          id="1"
          defaultVisible
          name={name}
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
      await canvas.findByText("Change Territory Name")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
  }
};
