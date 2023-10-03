import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import UpdateUser from "./updateuser";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update User",
  component: UpdateUser
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    uid: "testuid",
    congregation: "testcongregation",
    name: "testname",
    role: 1,
    footerSaveAcl: 1
  },
  argTypes: {
    uid: {
      control: {
        type: "text"
      }
    },
    congregation: {
      control: {
        type: "text"
      }
    },
    name: {
      control: {
        type: "text"
      }
    },
    role: {
      control: {
        type: "number"
      }
    },
    footerSaveAcl: {
      control: {
        type: "number"
      }
    }
  },
  render: ({ uid, congregation, name, role, footerSaveAcl }) => (
    <Provider>
      <NiceModal.Provider>
        <Button
          variant="outline-primary"
          onClick={() => {
            ModalManager.show(UpdateUser, {
              uid,
              congregation,
              name,
              role,
              footerSaveAcl
            });
          }}
        >
          Test updateuser
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Update testname Role")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Delete Access")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Read-only")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Conductor")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Administrator")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
