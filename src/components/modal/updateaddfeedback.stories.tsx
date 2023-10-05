import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import UpdateAddressFeedback from "./updateaddfeedback";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Address Feedback",
  component: UpdateAddressFeedback,
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
    name: "Test Address Name",
    footerSaveAcl: 1,
    postalCode: "test",
    congregation: "test",
    helpLink: "test",
    currentFeedback: "test",
    currentName: "test"
  },
  render: ({
    name,
    footerSaveAcl,
    postalCode,
    congregation,
    helpLink,
    currentFeedback,
    currentName
  }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateAddressFeedback
          id="1"
          defaultVisible
          name={name}
          footerSaveAcl={footerSaveAcl}
          postalCode={postalCode}
          congregation={congregation}
          helpLink={helpLink}
          currentFeedback={currentFeedback}
          currentName={currentName}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Feedback on Test Address Name")
    ).toBeInTheDocument();
    await expect(await canvas.findByRole("textbox")).toBeInTheDocument();
  }
};
