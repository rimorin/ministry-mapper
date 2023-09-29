import { Modal } from "react-bootstrap";
import ModalUnitTitle from "./title";
import { Meta, StoryObj } from "@storybook/react";
import { TERRITORY_TYPES } from "../../utils/constants";

const meta: Meta = {
  title: "Modal/Title",
  component: ModalUnitTitle,
  parameters: {
    unit: {
      name: "Unit",
      type: "string"
    },
    propertyPostal: {
      name: "Property Postal",
      type: "string"
    },
    floor: {
      name: "Floor",
      type: "string"
    },
    postal: {
      name: "Postal",
      type: "string"
    },
    name: {
      name: "Name",
      type: "string"
    },
    type: {
      name: "Type",
      type: "string"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicHousing: Story = {
  args: {
    unit: "123",
    floor: "10",
    postal: "200001",
    name: "Romulan Empire",
    type: TERRITORY_TYPES.PUBLIC
  },
  render: ({ unit, propertyPostal, floor, postal, name, type }) => (
    <Modal show={true}>
      <ModalUnitTitle
        unit={unit}
        propertyPostal={propertyPostal}
        floor={floor}
        postal={postal}
        type={type}
        name={name}
      />
      <Modal.Body></Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  )
};

export const PrivateHousing: Story = {
  args: {
    unit: "01",
    propertyPostal: "200001",
    floor: "10",
    postal: "200001",
    name: "Romulan Starbase",
    type: TERRITORY_TYPES.PRIVATE
  },

  render: ({ unit, propertyPostal, floor, postal, name, type }) => (
    <Modal show={true}>
      <ModalUnitTitle
        unit={unit}
        propertyPostal={propertyPostal}
        floor={floor}
        postal={postal}
        type={type}
        name={name}
      />
      <Modal.Body></Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  )
};
