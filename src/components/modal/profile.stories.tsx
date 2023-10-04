import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import GetProfile from "./profile";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Profile",
  component: GetProfile
};

export default meta;

type Story = StoryObj<typeof meta>;

// user arg
export const Default: Story = {
  args: {
    user: {
      displayName: "test"
    }
  },
  render: ({ user }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(GetProfile, {
              user
            });
          }}
        >
          Test profile
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(await canvas.findByText("My Profile")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Email")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Name")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
