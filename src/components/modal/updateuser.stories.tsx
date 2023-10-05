import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import UpdateUser from "./updateuser";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update User",
  component: UpdateUser,
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
        <UpdateUser
          id="1"
          defaultVisible
          uid={uid}
          congregation={congregation}
          name={name}
          role={role}
          footerSaveAcl={footerSaveAcl}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Update testname Role")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Delete Access")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Read-only")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Conductor")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Administrator")).toBeInTheDocument();
  }
};
