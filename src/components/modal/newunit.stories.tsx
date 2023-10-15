import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import NewUnit from "./newunit";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Unit",
  component: NewUnit,
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
    postalCode: "test",
    addressData: "test",
    defaultType: "test"
  },
  render: ({ footerSaveAcl, postalCode, addressData, defaultType }) => (
    <Provider>
      <NiceModal.Provider>
        <NewUnit
          id="1"
          defaultVisible
          congregation="test"
          footerSaveAcl={footerSaveAcl}
          postalCode={postalCode}
          addressData={addressData}
          defaultType={defaultType}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Add unit to test")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Unit number")
    ).toBeInTheDocument();
  }
};
