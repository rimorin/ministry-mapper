import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import ConfirmSlipDetails from "./slipdetails";

const meta: Meta = {
  title: "Administrator/Confirm Slip Details",
  component: ConfirmSlipDetails,
  decorators: [
    (storyFn) => (
      <div style={{ width: "1200px", height: "800px" }}>{storyFn()}</div>
    )
  ],
  parameters: {
    // Fixed date so that calendar UI does not change on every storybook test
    date: new Date("September 15, 2023 10:00:00")
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    addressName: "test",
    userAccessLevel: 1,
    isPersonalSlip: true
  },
  render: ({ addressName, userAccessLevel, isPersonalSlip }) => (
    <NiceModal.Provider>
      <ConfirmSlipDetails
        id="1"
        addressName={addressName}
        userAccessLevel={userAccessLevel}
        defaultVisible
        isPersonalSlip={isPersonalSlip}
      />
    </NiceModal.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Confirm personal slip details for test")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Publishers Name")
    ).toBeInTheDocument();
  }
};
