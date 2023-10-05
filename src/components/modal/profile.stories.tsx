import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import GetProfile from "./profile";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Profile",
  component: GetProfile,
  decorators: [
    (storyFn) => (
      <div style={{ width: "1200px", height: "800px" }}>{storyFn()}</div>
    )
  ]
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
        <GetProfile id="1" defaultVisible user={user} />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(await canvas.findByText("My Profile")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Email")).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Name")).toBeInTheDocument();
  }
};
