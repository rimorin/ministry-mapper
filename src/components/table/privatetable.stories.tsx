import { StoryObj, Meta } from "@storybook/react";
import PrivateTerritoryTable from "./privatetable";
import { NOT_HOME_STATUS_CODES, STATUS_CODES } from "../../utils/constants";

const meta: Meta = {
  title: "Navigation/Private Table",
  component: PrivateTerritoryTable
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isAdmin: true,
    houses: {
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
        },
        {
          number: "104",
          type: "cn",
          status: STATUS_CODES.DO_NOT_CALL,
          note: "",
          nhcount: 0
        },
        {
          number: "106",
          type: "cn",
          status: STATUS_CODES.DO_NOT_CALL,
          note: "",
          nhcount: 0
        },
        {
          number: "108",
          type: "cn",
          status: STATUS_CODES.INVALID,
          note: "",
          nhcount: 0
        },
        {
          number: "110",
          type: "cn",
          status: STATUS_CODES.NOT_HOME,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.THIRD_TRY
        },
        {
          number: "112",
          type: "cn",
          status: STATUS_CODES.NOT_HOME,
          note: "",
          nhcount: NOT_HOME_STATUS_CODES.SECOND_TRY
        }
      ]
    },
    completedPercent: {
      completedValue: 0
    },
    policy: {
      defaultType: "cn",
      getUnitColor: () => {
        return;
      }
    },
    handleHouseUpdate: () => {
      return;
    }
  }
};
