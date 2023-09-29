import { USER_ACCESS_LEVELS } from "../../utils/constants";
import UserListing from "./userlist";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/User Listing",
  component: UserListing
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showListing: true,
    currentUid: "9999999",
    handleSelect: () => {
      return;
    },
    users: [
      {
        uid: "12301",
        name: "John Doe",
        email: "johndoe@mm.com",
        verified: true,
        role: USER_ACCESS_LEVELS.CONDUCTOR.CODE
      },
      {
        uid: "12302",
        name: "John Lok",
        email: "johnlok@mm.com",
        verified: true,
        role: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE
      },
      {
        uid: "12303",
        name: "John Mok",
        email: "johnmok@mm.com",
        verified: true,
        role: USER_ACCESS_LEVELS.READ_ONLY.CODE
      },
      {
        uid: "12304",
        name: "John Goh",
        email: "johngoh@mm.com",
        verified: true,
        role: USER_ACCESS_LEVELS.NO_ACCESS.CODE
      }
    ]
  }
};
