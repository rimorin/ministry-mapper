import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import ChangePassword from "./changepassword";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import { Button } from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";
import ModalManager from "@ebay/nice-modal-react";
import { within, userEvent } from "@storybook/testing-library";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Password",
  component: ChangePassword
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      email: "rimorin@gmail.com"
    },
    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE
  },
  render: ({ user, userAccessLevel }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangePassword, {
              user,
              userAccessLevel
            });
          }}
        >
          Test changepassword
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    const changePass = await canvas.findByText("Change Password");
    await expect(changePass).toBeInTheDocument();
    await expect(canvas.getByLabelText("New Password")).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Confirm New Password")
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Existing Password")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByText("Change Password")).toBeNull();
  }
};

export const ValidPassword: Story = {
  args: {
    user: {
      email: "rimorin@gmail.com"
    },
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE
  },
  render: ({ user, userAccessLevel }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangePassword, {
              user,
              userAccessLevel
            });
          }}
        >
          Test changepassword
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    const changePass = await canvas.findByText("Change Password");
    await expect(changePass).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect(canvas.getByLabelText("New Password")).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Confirm New Password")
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Existing Password")
    ).toBeInTheDocument();
    await userEvent.type(
      canvas.getByLabelText("New Password"),
      "Testpassword1"
    );
    await userEvent.type(
      canvas.getByLabelText("Confirm New Password"),
      "Testpassword1"
    );
    await userEvent.type(
      canvas.getByLabelText("Existing Password"),
      "Exitstingpassword1"
    );
    // check if save button is enabled
    await expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByText("Change Password")).toBeNull();
  }
};

export const InvalidPassword: Story = {
  args: {
    user: {
      email: "test@gmail.com"
    },
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE
  },
  render: ({ user, userAccessLevel }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(ChangePassword, {
              user,
              userAccessLevel
            });
          }}
        >
          Test changepassword
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Change Password")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect(canvas.getByLabelText("New Password")).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Confirm New Password")
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Existing Password")
    ).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText("New Password"), "test");
    await userEvent.type(canvas.getByLabelText("Confirm New Password"), "test");
    await userEvent.type(canvas.getByLabelText("Existing Password"), "test");
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvas.queryByText("Change Password")).toBeNull();
  }
};
