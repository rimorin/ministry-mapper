import { StoryObj, Meta } from "@storybook/react";
import PublisherTerritoryTable from "./publisher";
import {
  NOT_HOME_STATUS_CODES,
  STATUS_CODES,
  TERRITORY_TYPES
} from "../../utils/constants";

const meta: Meta = {
  title: "Publisher/Slip",
  component: PublisherTerritoryTable
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicHousing: Story = {
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
            status: STATUS_CODES.DO_NOT_CALL,
            note: "",
            nhcount: 0
          }
        ]
      }
    ],
    maxUnitNumberLength: 3,
    completedPercent: 0,
    policy: {
      maxTries: 3,
      countableTypes: ["cn", "dn", "dnm"],
      getUnitColor: () => {
        return;
      },
      defaultType: "cn"
    },
    territoryType: "public",
    handleUnitStatusUpdate: () => {
      return;
    }
  }
};

export const PrivateHousing: Story = {
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
      }
    ],
    maxUnitNumberLength: 3,
    completedPercent: 0,
    policy: {
      maxTries: 3,
      countableTypes: ["cn", "dn", "dnm"],
      getUnitColor: () => {
        return;
      },
      defaultType: "cn"
    },
    territoryType: TERRITORY_TYPES.PRIVATE,
    handleUnitStatusUpdate: () => {
      return;
    }
  }
};
