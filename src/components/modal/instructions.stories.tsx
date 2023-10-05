import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";

import UpdateAddressInstructions from "./instructions";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Address Instructions",
  component: UpdateAddressInstructions,
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
    congregation: "test",
    postalCode: "test",
    addressName: "test",
    userAccessLevel: 1,
    instructions: "test",
    userName: "test"
  },
  render: ({
    congregation,
    postalCode,
    addressName,
    userAccessLevel,
    instructions,
    userName
  }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateAddressInstructions
          id="1"
          defaultVisible
          congregation={congregation}
          postalCode={postalCode}
          addressName={addressName}
          userAccessLevel={userAccessLevel}
          instructions={instructions}
          userName={userName}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Instructions on test")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("textbox")).toBeInTheDocument();
  }
};
