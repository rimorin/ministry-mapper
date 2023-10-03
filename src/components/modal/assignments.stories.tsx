import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { StoryObj, Meta } from "@storybook/react";
import GetAssignments from "./assignments";
import { LINK_TYPES } from "../../utils/constants";
import ModalManager from "@ebay/nice-modal-react";
import { Button } from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";

const meta: Meta = {
  title: "Administrator/Assignments",
  component: GetAssignments
};

export default meta;

type Story = StoryObj<typeof meta>;

export const AllLinks: Story = {
  args: {
    assignments: [
      {
        key: "1",
        name: "test 1",
        linkType: LINK_TYPES.ASSIGNMENT,
        congregation: "test",
        postalCode: "test",
        tokenCreatetime: 1622714400000,
        tokenEndtime: 1622714400000,
        publisherName: "john"
      },
      {
        key: "2",
        name: "test 2",
        linkType: LINK_TYPES.PERSONAL,
        congregation: "test",
        postalCode: "test",
        tokenCreatetime: 1622714400000,
        tokenEndtime: 1622714400000,
        publisherName: "eric"
      }
    ]
  },
  render: ({ assignments, assignmentType, assignmentTerritory }) => (
    <NiceModal.Provider>
      <Button
        variant="outline-primary"
        onClick={(e) => {
          e.preventDefault();
          ModalManager.show(GetAssignments, {
            assignments,
            assignmentType,
            assignmentTerritory
          });
        }}
      >
        Get All Links
      </Button>
    </NiceModal.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(await canvas.findByText("Assignments")).toBeInTheDocument();
    await expect(canvas.getByText("Publisher : john")).toBeInTheDocument();
    await expect(canvas.getByText("Assign")).toBeInTheDocument();
    await expect(canvas.getByText("Personal")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const PersonalLinks: Story = {
  args: {
    assignments: [
      {
        key: "1",
        name: "test 1",
        linkType: LINK_TYPES.PERSONAL,
        congregation: "test",
        postalCode: "test",
        tokenCreatetime: 1622714400000,
        tokenEndtime: 1622714400000,
        publisherName: "john"
      }
    ],
    assignmentType: LINK_TYPES.PERSONAL,
    assignmentTerritory: "Starfleet"
  },
  render: ({ assignments, assignmentType, assignmentTerritory }) => (
    <NiceModal.Provider>
      <Button
        variant="outline-primary"
        onClick={(e) => {
          e.preventDefault();
          ModalManager.show(GetAssignments, {
            assignments,
            assignmentType,
            assignmentTerritory
          });
        }}
      >
        Get Personal Links
      </Button>
    </NiceModal.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Starfleet Personal Links")
    ).toBeInTheDocument();
    await expect(canvas.getByText("Publisher : john")).toBeInTheDocument();
    await expect(canvas.getByText("Link")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const AssignmentLinks: Story = {
  args: {
    assignments: [
      {
        key: "1",
        name: "test 1",
        linkType: LINK_TYPES.PERSONAL,
        congregation: "test",
        postalCode: "test",
        tokenCreatetime: 1622714400000,
        tokenEndtime: 1622714400000,
        publisherName: "john"
      }
    ],
    assignmentType: LINK_TYPES.ASSIGNMENT,
    assignmentTerritory: "Starfleet"
  },
  render: ({ assignments, assignmentType, assignmentTerritory }) => (
    <NiceModal.Provider>
      <Button
        variant="outline-primary"
        onClick={(e) => {
          e.preventDefault();
          ModalManager.show(GetAssignments, {
            assignments,
            assignmentType,
            assignmentTerritory
          });
        }}
      >
        Get Assign Links
      </Button>
    </NiceModal.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentNode as HTMLElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText("Starfleet Assign Links")
    ).toBeInTheDocument();
    await expect(canvas.getByText("Publisher : john")).toBeInTheDocument();
    await expect(canvas.getByText("Link")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
