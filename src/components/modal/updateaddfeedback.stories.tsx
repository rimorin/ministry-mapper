import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import UpdateAddressFeedback from "./updateaddfeedback";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Address Feedback",
  component: UpdateAddressFeedback
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
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(UpdateAddressFeedback, {
              name,
              footerSaveAcl,
              postalCode,
              congregation,
              helpLink,
              currentFeedback,
              currentName
            });
          }}
        >
          Test updateaddfeedback
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Feedback on Test Address Name")
    ).toBeInTheDocument();
    await expect(await canvas.findByRole("textbox")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
