import { Table } from "react-bootstrap";
import FloorHeader from "./floor";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Floor Header",
  component: FloorHeader,
  parameters: {
    index: {
      defaultValue: 1,
      type: "number"
    },
    floor: {
      defaultValue: 1,
      type: "number"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    index: 1,
    floor: "1"
  },
  render: ({ index, floor }) => (
    <Table responsive bordered striped hover>
      <tr>
        <FloorHeader index={index} floor={floor} />
      </tr>
    </Table>
  )
};

export const SecondFloor: Story = {
  args: {
    index: 2,
    floor: "2"
  },
  render: ({ index, floor }) => (
    <Table responsive bordered striped hover>
      <tr>
        <FloorHeader index={index} floor={floor} />
      </tr>
    </Table>
  )
};
