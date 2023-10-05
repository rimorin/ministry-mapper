import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import NewPublicAddress from "./newpublicadd";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Public Address",
  component: NewPublicAddress,
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
    footerSaveAcl: 1,
    congregation: "testcongregation",
    territoryCode: "testterritorycode",
    defaultType: "testdefaulttype"
  },
  render: ({ footerSaveAcl, congregation, territoryCode, defaultType }) => (
    <Provider>
      <NiceModal.Provider>
        <NewPublicAddress
          id="1"
          defaultVisible
          footerSaveAcl={footerSaveAcl}
          congregation={congregation}
          territoryCode={territoryCode}
          defaultType={defaultType}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Create Public Address")
    ).toBeInTheDocument();
    await expect(await canvas.findByText("Postal Code")).toBeInTheDocument();
    await expect(await canvas.findByText("Address Name")).toBeInTheDocument();
    await expect(await canvas.findByText("No. of floors")).toBeInTheDocument();
    await expect(await canvas.findByText("Unit Sequence")).toBeInTheDocument();
  }
};
