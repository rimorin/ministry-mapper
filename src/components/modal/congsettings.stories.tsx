import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import ModalManager from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import UpdateCongregationSettings from "./congsettings";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Congregation Settings",
  component: UpdateCongregationSettings
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
        <Button
          variant="outline-primary"
          onClick={(e) => {
            e.preventDefault();
            ModalManager.show(UpdateCongregationSettings, {
              currentCongregation,
              currentName,
              currentMaxTries,
              currentDefaultExpiryHrs,
              currentIsMultipleSelection
            });
          }}
        >
          Test congsettings
        </Button>
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
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
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
