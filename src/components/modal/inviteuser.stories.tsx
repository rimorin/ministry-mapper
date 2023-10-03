import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import InviteUser from "./inviteuser";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Invite User",
  component: InviteUser
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    email: "",
    uid: "testuid",
    congregation: "testcongregation",
    name: "testname",
    role: 1,
    footerSaveAcl: 1
  },
  render: ({ email, uid, congregation, name, role, footerSaveAcl }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(InviteUser, {
              email,
              uid,
              congregation,
              name,
              role,
              footerSaveAcl
            });
          }}
        >
          Test invite user
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(await canvas.findByText("Invite User")).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("User email")
    ).toBeInTheDocument();
    await expect(await canvas.findByText("Read-only")).toBeInTheDocument();
    await expect(await canvas.findByText("Conductor")).toBeInTheDocument();
    await expect(await canvas.findByText("Administrator")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
