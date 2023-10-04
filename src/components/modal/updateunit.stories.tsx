import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import UpdateUnit from "./updateunit";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Unit",
  component: UpdateUnit
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
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(UpdateUnit, {
              postalCode,
              unitNo,
              unitSequence,
              unitLength,
              unitDisplay,
              addressData
            });
          }}
        >
          Test updateunit
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(await canvas.findByText("Unit 100")).toBeInTheDocument();
    await expect(
      await canvas.findByText("Sequence Number")
    ).toBeInTheDocument();
  }
};
