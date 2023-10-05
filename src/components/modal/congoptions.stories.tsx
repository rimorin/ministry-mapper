import UpdateCongregationOptions from "./congoptions";
import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import { USER_ACCESS_LEVELS } from "../../utils/constants";
import NiceModal from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Congregation Options",
  component: UpdateCongregationOptions
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentCongregation: "testcongregation",
    footerSaveAcl: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    congregation: "testcongregation",
    territoryCode: "testterritorycode"
  },
  render: ({ currentCongregation }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateCongregationOptions
          id="1"
          defaultVisible
          currentCongregation={currentCongregation}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Household Options")
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
