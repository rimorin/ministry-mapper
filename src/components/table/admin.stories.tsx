import { Meta, StoryObj } from "@storybook/react";
import AdminTable from "./admin";
import {
  STATUS_CODES,
  TERRITORY_TYPES,
  USER_ACCESS_LEVELS
} from "../../utils/constants";

const meta: Meta = {
  title: "Administrator/Dashboard",
  component: AdminTable
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicHousingWithAdminAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    territoryType: TERRITORY_TYPES.PUBLIC
  }
};

export const PrivateHousingWithAdminAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    territoryType: TERRITORY_TYPES.PRIVATE
  }
};

export const PublicHousingWithConductorAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    territoryType: TERRITORY_TYPES.PUBLIC
  }
};

export const PrivateHousingWithConductorAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    territoryType: TERRITORY_TYPES.PRIVATE
  }
};

export const PublicHousingWithReadOnlyAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    territoryType: TERRITORY_TYPES.PUBLIC
  }
};

export const PrivateHousingWithReadOnlyAccess: Story = {
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
    adminUnitHeaderStyle: "",
    handleUnitNoUpdate: () => {
      return;
    },
    handleUnitStatusUpdate: () => {
      return;
    },
    handleFloorDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    territoryType: TERRITORY_TYPES.PRIVATE
  }
};
