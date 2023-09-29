import { Table } from "react-bootstrap";
import TableHeader from "./header";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Table Header",
  component: TableHeader
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    floors: [
      {
        floor: 1,
        units: [
          {
            number: "98",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "100",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "102",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          }
        ]
      },
      {
        floor: 2,
        units: [
          {
            number: "98",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "100",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "102",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          }
        ]
      }
    ],
    maxUnitNumber: 3
  },
  render: ({ floors, maxUnitNumber }) => {
    return (
      <Table responsive bordered striped hover>
        <TableHeader floors={floors} maxUnitNumber={maxUnitNumber} />
      </Table>
    );
  }
};

export const DuelMaxUnitNumber: Story = {
  args: {
    floors: [
      {
        floor: 2,
        units: [
          {
            number: "8",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "9",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "10",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          }
        ]
      },
      {
        floor: 2,
        units: [
          {
            number: "8",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "9",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          },
          {
            number: "10",
            type: "cn",
            status: 0,
            note: "This is a note",
            nhcount: 0
          }
        ]
      }
    ],
    maxUnitNumber: 2
  },
  render: ({ floors, maxUnitNumber }) => {
    return (
      <Table responsive bordered striped hover>
        <TableHeader floors={floors} maxUnitNumber={maxUnitNumber} />
      </Table>
    );
  }
};
