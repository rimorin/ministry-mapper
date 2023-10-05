import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import ChangePassword from "./changepassword";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import NiceModal from "@ebay/nice-modal-react";
import { within, userEvent } from "@storybook/testing-library";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Password",
  component: ChangePassword,
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
    user: {
      email: "rimorin@gmail.com"
    },
    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE
  },
  render: ({ user, userAccessLevel }) => (
    <Provider>
      <NiceModal.Provider>
        <ChangePassword
          id="1"
          defaultVisible
          user={user}
          userAccessLevel={userAccessLevel}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    const changePass = await canvas.findByText("Change Password");
    await expect(changePass).toBeInTheDocument();
    await expect(canvas.getByLabelText("New Password")).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Confirm New Password")
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText("Existing Password")
    ).toBeInTheDocument();
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
        <ChangePassword
          id="1"
          defaultVisible
          user={user}
          userAccessLevel={userAccessLevel}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
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
        <ChangePassword
          id="1"
          defaultVisible
          user={user}
          userAccessLevel={userAccessLevel}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
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
  }
};
