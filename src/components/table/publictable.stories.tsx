import { StoryObj, Meta } from "@storybook/react";
import PublicTerritoryTable from "./publictable";
import { STATUS_CODES } from "../../utils/constants";

const meta: Meta = {
  title: "Navigation/Public Table",
  component: PublicTerritoryTable
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    postalCode: "123456",
    floors: [
      {
        floor: "1",
        units: [
          {
            number: "98",
            type: "cn",
            status: STATUS_CODES.DONE,
            note: "",
            nhcount: 0
          },
          {
            number: "100",
            type: "cn",
            status: STATUS_CODES.NOT_HOME,
            note: "",
            nhcount: 1
          },
          {
            number: "102",
            type: "cn",
            status: STATUS_CODES.DO_NOT_CALL,
            note: "",
            nhcount: 0
          }
        ]
      },
      {
        floor: "2",
        units: [
          {
            number: "98",
            type: "cn",
            status: STATUS_CODES.NOT_HOME,
            note: "",
            nhcount: 2
          },
          {
            number: "100",
            type: "cn",
            status: STATUS_CODES.INVALID,
            note: "",
            nhcount: 0
          },
          {
            number: "102",
            type: "cn",
            status: STATUS_CODES.INVALID,
            note: "",
            nhcount: 0
          }
        ]
      }
    ],
    maxUnitNumberLength: 3,
    completedPercent: {
      completedValue: 0,
      totalValue: 0
    },
    policy: {
      defaultType: "cn",
      getUnitColor: () => {
        return;
      }
    },
    handleUnitStatusUpdate: () => {
      return;
    }
  }
};
