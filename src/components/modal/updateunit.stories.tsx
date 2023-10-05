import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import UpdateUnit from "./updateunit";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Unit",
  component: UpdateUnit,
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
    postalCode: "100001",
    unitNo: "100",
    unitSequence: 1,
    unitLength: 3,
    unitDisplay: "100",
    addressData: "test"
  },
  render: ({
    postalCode,
    unitNo,
    unitSequence,
    unitLength,
    unitDisplay,
    addressData
  }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateUnit
          id="1"
          defaultVisible
          postalCode={postalCode}
          unitNo={unitNo}
          unitSequence={unitSequence}
          unitLength={unitLength}
          unitDisplay={unitDisplay}
          addressData={addressData}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(await canvas.findByText("Unit 100")).toBeInTheDocument();
    await expect(
      await canvas.findByText("Sequence Number")
    ).toBeInTheDocument();
  }
};
