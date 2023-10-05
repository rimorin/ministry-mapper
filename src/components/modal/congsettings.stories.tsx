import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { within } from "@storybook/testing-library";
import UpdateCongregationSettings from "./congsettings";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Congregation Settings",
  component: UpdateCongregationSettings,
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
    currentCongregation: "testcongregation",
    currentName: "testcongregation",
    currentMaxTries: 2,
    currentDefaultExpiryHrs: 2,
    currentIsMultipleSelection: false
  },
  argTypes: {
    currentCongregation: {
      control: {
        type: "text"
      }
    },
    currentName: {
      control: {
        type: "text"
      }
    },
    currentMaxTries: {
      control: {
        type: "number"
      }
    },
    currentDefaultExpiryHrs: {
      control: {
        type: "number"
      }
    },
    currentIsMultipleSelection: {
      control: {
        type: "boolean"
      }
    }
  },
  render: ({
    currentCongregation,
    currentName,
    currentMaxTries,
    currentDefaultExpiryHrs,
    currentIsMultipleSelection
  }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateCongregationSettings
          id="1"
          defaultVisible
          currentCongregation={currentCongregation}
          currentName={currentName}
          currentMaxTries={currentMaxTries}
          currentDefaultExpiryHrs={currentDefaultExpiryHrs}
          currentIsMultipleSelection={currentIsMultipleSelection}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(
      await canvas.findByText("Congregation Settings")
    ).toBeInTheDocument();
    await expect(await canvas.findByLabelText("Name")).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("No. of Tries")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Default Slip Expiry Hours")
    ).toBeInTheDocument();
    await expect(
      await canvas.findByLabelText("Multiple Household Types")
    ).toBeInTheDocument();
  }
};
