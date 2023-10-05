import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import NiceModal from "@ebay/nice-modal-react";
import { userEvent, within } from "@storybook/testing-library";
import UpdateUnitStatus from "./updatestatus";
import { Provider } from "@rollbar/react";

const meta: Meta = {
  title: "Administrator/Update Unit Status",
  component: UpdateUnitStatus
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    addressName: "test",
    userAccessLevel: 2,
    territoryType: "test",
    postalCode: "100001",
    unitNo: "100",
    unitNoDisplay: "100",
    addressData: "test",
    floor: "1",
    floorDisplay: "01",
    unitDetails: {
      number: "100",
      note: "test",
      type: "ha",
      status: "-1",
      nhcount: "test",
      dnctime: 1622714400000,
      sequence: 1
    },
    options: [
      {
        code: "ha",
        description: "Human"
      },
      {
        code: "an",
        description: "Animal"
      },
      {
        code: "ot",
        description: "Other"
      }
    ],
    defaultOption: "ha",
    isMultiselect: true
  },
  render: ({
    addressName,
    userAccessLevel,
    territoryType,
    postalCode,
    unitNo,
    unitNoDisplay,
    addressData,
    floor,
    floorDisplay,
    unitDetails,
    options,
    defaultOption,
    isMultiselect
  }) => (
    <Provider>
      <NiceModal.Provider>
        <UpdateUnitStatus
          id="1"
          defaultVisible
          congregation="test"
          addressName={addressName}
          userAccessLevel={userAccessLevel}
          territoryType={territoryType}
          postalCode={postalCode}
          unitNo={unitNo}
          unitNoDisplay={unitNoDisplay}
          addressData={addressData}
          floor={floor}
          floorDisplay={floorDisplay}
          unitDetails={unitDetails}
          options={options}
          defaultOption={defaultOption}
          isMultiselect={isMultiselect}
        />
      </NiceModal.Provider>
    </Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await expect(await canvas.findByText("Not Done")).toBeInTheDocument();
    await expect(await canvas.findByText("Done")).toBeInTheDocument();
    await expect(await canvas.findByText("DNC")).toBeInTheDocument();
    await expect(await canvas.findByText("Not Home")).toBeInTheDocument();
    await expect(await canvas.findByText("Invalid")).toBeInTheDocument();
    await expect(await canvas.findByText("Household")).toBeInTheDocument();
    await expect(await canvas.findByText("Notes")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  }
};
