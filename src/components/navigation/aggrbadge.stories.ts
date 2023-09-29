import AggrBadge from "./aggrbadge";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Navigation/Aggregate Badge",
  component: AggrBadge,
  parameters: {
    aggregate: {
      defaultValue: 0,
      type: "number"
    },
    isDataFetched: {
      defaultValue: true,
      type: "boolean"
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    aggregate: 0,
    isDataFetched: true
  }
};

export const WithAggregate: Story = {
  args: {
    aggregate: 10,
    isDataFetched: true
  }
};

export const FetchingAggregate: Story = {
  args: {
    aggregate: 10,
    isDataFetched: false
  }
};

export const Aggregate70PercentBadge: Story = {
  args: {
    aggregate: 70,
    isDataFetched: true
  }
};

export const Aggregate71PercentBadge: Story = {
  args: {
    aggregate: 71,
    isDataFetched: true
  }
};

export const Aggregate100PercentBadge: Story = {
  args: {
    aggregate: 100,
    isDataFetched: true
  }
};
