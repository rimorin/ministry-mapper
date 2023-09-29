import TerritoryListing from "./territorylist";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Territory Listing",
  component: TerritoryListing,
  parameters: {
    showListing: {
      defaultValue: true,
      type: "boolean"
    },
    hideSelectedTerritory: {
      defaultValue: true,
      type: "boolean"
    },
    selectedTerritory: {
      defaultValue: "N1",
      type: "string"
    },
    territories: {
      defaultValue: [
        {
          code: "N1",
          name: "Nebula 1"
        },
        {
          code: "N2",
          name: "Nebula 2"
        },
        {
          code: "N3",
          name: "Nebula 3"
        }
      ],
      type: "array"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showListing: true,
    hideSelectedTerritory: false,
    selectedTerritory: "N1",
    territories: [
      {
        code: "N1",
        name: "Nebula 1"
      },
      {
        code: "N2",
        name: "Nebula 2"
      },
      {
        code: "N3",
        name: "Nebula 3"
      }
    ]
  }
};

export const HideSelectedTerritory: Story = {
  args: {
    showListing: true,
    hideSelectedTerritory: true,
    selectedTerritory: "N1",
    territories: [
      {
        code: "N1",
        name: "Nebula 1"
      },
      {
        code: "N2",
        name: "Nebula 2"
      },
      {
        code: "N3",
        name: "Nebula 3"
      }
    ]
  }
};

export const HideListing: Story = {
  args: {
    showListing: false,
    hideSelectedTerritory: false,
    selectedTerritory: "N1",
    territories: [
      {
        code: "N1",
        name: "Nebula 1"
      },
      {
        code: "N2",
        name: "Nebula 2"
      },
      {
        code: "N3",
        name: "Nebula 3"
      }
    ]
  }
};
