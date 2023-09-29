import { StoryObj, Meta } from "@storybook/react";
import ModalFooter from "./footer";
import { TERRITORY_TYPES, USER_ACCESS_LEVELS } from "../../utils/constants";
import { Modal } from "react-bootstrap";

const meta: Meta = {
  component: ModalFooter,
  title: "Modal/Footer"
};

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminLevelAccessToAdminSaveButton: Story = {
  args: {
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const ConductorLevelAccessToAdminSaveButton: Story = {
  args: {
    propertyPostal: "12345",
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    propertyPostal,
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        propertyPostal={propertyPostal}
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const ReadonlyLevelAccessToAdminSaveButton: Story = {
  args: {
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.READ_ONLY.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const ButtonIsSaving: Story = {
  args: {
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: true,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const ButtonIsDisabled: Story = {
  args: {
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: true
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const CustomButtonLabel: Story = {
  args: {
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Custom Button Label",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const PrivatePropertyPostalButton: Story = {
  args: {
    propertyPostal: "12345",
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    type: TERRITORY_TYPES.PRIVATE,
    userAccessLevel: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.CONDUCTOR.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};

export const PrivatePropertyPostalButtonWithAdminAccess: Story = {
  args: {
    propertyPostal: "12345",
    handleClick: () => {
      return;
    },
    handleDelete: () => {
      return;
    },
    type: TERRITORY_TYPES.PRIVATE,
    userAccessLevel: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    requiredAcLForSave: USER_ACCESS_LEVELS.TERRITORY_SERVANT.CODE,
    isSaving: false,
    submitLabel: "Save",
    disableSubmitBtn: false
  },
  render: ({
    handleClick,
    handleDelete,
    userAccessLevel,
    requiredAcLForSave,
    isSaving,
    submitLabel,
    disableSubmitBtn
  }) => (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title>Footer</Modal.Title>
      </Modal.Header>
      <ModalFooter
        handleClick={handleClick}
        handleDelete={handleDelete}
        userAccessLevel={userAccessLevel}
        requiredAcLForSave={requiredAcLForSave}
        isSaving={isSaving}
        submitLabel={submitLabel}
        disableSubmitBtn={disableSubmitBtn}
      />
    </Modal>
  )
};
