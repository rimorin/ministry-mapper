import ChangeAddressName from "./changeaddname";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import NiceModal from "@ebay/nice-modal-react";
import { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Change Address Name",
  component: ChangeAddressName,
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
    name: "test",
    footerSaveAcl: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    postal: "test"
  },
  render: ({ name, footerSaveAcl, postal }) => (
    <Provider>
      <NiceModal.Provider>
        <ChangeAddressName
          id="1"
          congregation="test"
          defaultVisible
          name={name}
          footerSaveAcl={footerSaveAcl}
          postal={postal}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Change Address Name")
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
  }
};
