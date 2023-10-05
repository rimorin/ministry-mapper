import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import NewTerritoryCode from "./newterritorycd";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/New Territory Code",
  component: NewTerritoryCode
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    footerSaveAcl: 1,
    congregation: "testcongregation"
  },
  render: ({ footerSaveAcl, congregation }) => (
    <Provider>
      <NiceModal.Provider>
        <NewTerritoryCode
          id="1"
          defaultVisible
          footerSaveAcl={footerSaveAcl}
          congregation={congregation}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Create New Territory")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Territory Code")
    ).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Name")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
