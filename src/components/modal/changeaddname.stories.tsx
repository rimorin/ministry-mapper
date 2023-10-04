import ChangeAddressName from "./changeaddname";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { Button } from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";
import ModalManager from "@ebay/nice-modal-react";
import { Meta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Address Name",
  component: ChangeAddressName
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "test",
    footerSaveAcl: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postal: "test"
  },
  render: ({ name, footerSaveAcl, postal }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangeAddressName, {
              name,
              footerSaveAcl,
              postal
            });
          }}
        >
          Test changeaddname
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Change Address Name")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
