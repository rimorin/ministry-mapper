import { User } from "firebase/auth";
import { LinkSession, Policy } from "./policies";

interface userInterface {
  user: User;
}

interface nameInterface {
  name: string;
}

interface postalInterface {
  postalCode: string;
}

interface congregationInterface {
  congregation: string;
}

interface footerInterface {
  footerSaveAcl: number;
}

interface floorInterface {
  floor: string;
  floorDisplay?: string;
}

export interface unitDetails {
  number: string;
  note: string;
  type: string;
  status: string;
  nhcount: string;
  dnctime: number;
  sequence?: number;
  propertyPostal?: string;
}

export interface nothomeProps {
  nhcount?: string;
  classProp?: string;
}

export interface floorDetails extends floorInterface {
  units: Array<unitDetails>;
}

export interface unitProps {
  type: string;
  note?: string;
  status: string;
  nhcount?: string;
  defaultOption?: string;
}

export interface valuesDetails extends floorInterface, nameInterface {
  unit: string;
  unitDisplay?: string;
  type: string;
  note: string;
  postal?: string;
  feedback: string;
  status: string;
  link?: string;
  nhcount?: string;
  units?: string;
  floors?: number;
  newPostal?: string;
  code?: string;
  dnctime?: number;
  sequence: string;
  unitlength?: number;
  territoryType?: number;
  password?: string;
  cpassword?: string;
  propertyPostal?: string;
  instructions?: string;
  linkid?: string;
  linkExpiryHrs?: number;
}

export type adminProps = userInterface;

export interface territoryDetails extends nameInterface {
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addresses: any;
}

export interface addressDetails extends nameInterface, postalInterface {
  assigneeDetailsList: Array<LinkSession>;
  personalDetailsList: Array<LinkSession>;
  x_zip: string;
  floors: Array<floorDetails>;
  feedback: string;
  type: number;
  instructions: string;
}

export interface FormProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  handleGroupChange?: (
    value: string,
    event: React.ChangeEvent<HTMLElement>
  ) => void;
  handleChangeValues?: (values: string[]) => void;
  handleDateChange?: (date: Date) => void;
  changeDate?: number;
  changeValue?: string;
  changeValues?: string[];
  name?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  information?: string;
  inputType?: string;
  readOnly?: boolean;
  focus?: boolean;
}

export interface FloorProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  changeValue: number;
}

export interface TitleProps extends nameInterface, floorInterface {
  unit: string;
  postal?: string;
  type?: number;
  propertyPostal?: string;
}

export interface BrandingProps {
  naming: string;
}

export interface FooterProps {
  isSaving?: boolean;
  disableSubmitBtn?: boolean;
  userAccessLevel?: number;
  type?: number;
  propertyPostal?: string;
  requiredAcLForSave?: number;
  submitLabel?: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  handleDelete?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface SubmitBtnProps {
  isSaving: boolean;
  btnLabel?: string;
  disabled?: boolean;
}

export interface InstructionsProps {
  instructions: string;
  userAcl?: number;
  handleSave: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface LegendProps {
  showLegend: boolean;
  hideFunction?: () => void;
}

export interface TerritoryListingProps {
  showListing: boolean;
  hideFunction: () => void;
  selectedTerritory?: string;
  handleSelect?: (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => void;
  territories?: territoryDetails[];
  hideSelectedTerritory?: boolean;
}

export interface LoginProps {
  loginType: string;
}

export interface unitMaps {
  [key: string]: object | number | string;
}

export interface RouteDetails extends nameInterface, postalInterface {}

export interface AuthorizerProp {
  requiredPermission: number;
  userPermission: number | undefined;
  children: React.ReactElement;
}

export interface aggregateProp {
  aggregate?: number;
  isDataFetched?: boolean;
}

export interface ExpiryButtonProp {
  endtime: number;
}

export interface floorHeaderProp extends floorInterface {
  index: number;
}

export interface tableHeaderProp {
  floors: Array<floorDetails>;
  maxUnitNumber: number;
}

export interface territoryHeaderProp {
  name: string | undefined;
}

export interface backToTopProp {
  showButton: boolean;
}

export interface territoryTableProps extends postalInterface {
  floors: floorDetails[];
  maxUnitNumberLength: number;
  policy: Policy | undefined;
  completedPercent: {
    completedValue: number;
    completedDisplay: string;
  };
  adminUnitHeaderStyle?: string;
  userAccessLevel?: number;
  territoryType?: number;
  handleUnitStatusUpdate: (event: React.MouseEvent<HTMLElement>) => void;
  handleUnitNoUpdate?: (event: React.MouseEvent<HTMLElement>) => void;
  handleFloorDelete?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface territoryLandedProps extends postalInterface {
  isAdmin: boolean;
  houses: floorDetails;
  policy: Policy | undefined;
  completedPercent: {
    completedValue: number;
    completedDisplay: string;
  };
  adminUnitHeaderStyle?: string;
  userAccessLevel?: number;
  handleHouseUpdate: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface SignInDifferentProps {
  name?: string;
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface VerificationProps extends SignInDifferentProps {
  handleResendMail?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface HelpButtonProps {
  link: string;
  isWarningButton?: boolean;
}

export interface userDetails extends nameInterface {
  uid: string;
  email: string;
  verified: boolean;
  role: number;
}

export interface UserListingProps {
  showListing: boolean;
  hideFunction: () => void;
  currentUid?: string;
  handleSelect?: (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => void;
  users?: userDetails[];
}

export interface UserRoleProps {
  handleRoleChange?: (
    value: number,
    event: React.ChangeEvent<HTMLElement>
  ) => void;
  role?: number;
  isUpdate?: boolean;
}

export interface UserModalProps
  extends nameInterface,
    congregationInterface,
    footerInterface {
  email?: string | null;
  uid?: string;
  role?: number | undefined;
}

export interface SelectProps {
  value: string;
  label: string;
}

export interface OptionProps {
  code: string;
  description: string;
}

export interface HouseholdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleChange?: any;
  changeValue?: string;
  options: Array<SelectProps>;
  isMultiselect?: boolean;
}

export interface HHOptionProps {
  code: string;
  description: string;
  isCountable: boolean;
  isDefault?: boolean;
  sequence: number;
  isNew?: boolean;
}

export interface EnvironmentIndicatorProps {
  environment: string;
}

export interface UserRoleBadgeProps {
  role: number | undefined;
}

export type WelcomeProps = nameInterface;
export interface AssignmentModalProps extends congregationInterface {
  assignments: LinkSession[];
  assignmentType?: number;
  assignmentTerritory?: string;
}

export interface ChangeAddressNameModalProps
  extends nameInterface,
    footerInterface,
    congregationInterface {
  postal: string;
}

export interface ChangePasswordModalProps extends userInterface {
  userAccessLevel: number | undefined;
}

export interface ChangeAddressPostalCodeModalProps
  extends postalInterface,
    congregationInterface,
    footerInterface {
  territoryCode: string | undefined;
}

export interface ChangeTerritoryCodeModalProps
  extends congregationInterface,
    footerInterface {
  territoryCode: string;
}

export interface ChangeTerritoryNameModalProps
  extends congregationInterface,
    footerInterface {
  name: string | undefined;
  territoryCode: string;
}

export interface UpdateCongregationOptionsModalProps {
  currentCongregation: string;
}

export interface UpdateCongregationSettingsModalProps {
  currentName: string;
  currentCongregation: string;
  currentMaxTries: number;
  currentDefaultExpiryHrs: number;
  currentIsMultipleSelection: boolean;
}

export interface UpdateAddressInstructionsModalProps
  extends postalInterface,
    congregationInterface {
  addressName: string;
  userAccessLevel: number | undefined;
  instructions: string | undefined;
  userName: string;
}

export interface NewPrivateAddressModalProps
  extends congregationInterface,
    footerInterface {
  territoryCode: string;
  defaultType: string;
}

export type NewPublicAddressModalProps = NewPrivateAddressModalProps;

export interface NewTerritoryCodeModalProps
  extends congregationInterface,
    footerInterface {}

export interface NewUnitModalProps
  extends postalInterface,
    footerInterface,
    congregationInterface {
  addressData: addressDetails;
  defaultType: string;
}

export type UpdateProfileModalProps = userInterface;

export interface ConfirmSlipDetailsModalProps {
  addressName: string;
  userAccessLevel: number | undefined;
  isPersonalSlip: boolean;
}

export interface UpdateAddressFeedbackModalProps
  extends nameInterface,
    congregationInterface,
    postalInterface,
    footerInterface {
  helpLink: string;
  currentFeedback: string;
  currentName: string;
}

export interface UpdateAddressStatusModalProps
  extends postalInterface,
    congregationInterface,
    floorInterface {
  addressName: string | undefined;
  userAccessLevel: number | undefined;
  territoryType: number | undefined;
  unitNo: string;
  unitNoDisplay: string;
  addressData: addressDetails | undefined;
  unitDetails: unitDetails | undefined;
  options: Array<OptionProps>;
  defaultOption: string;
  isMultiselect: boolean;
}

export interface UpdateUnitModalProps
  extends postalInterface,
    congregationInterface {
  unitSequence: number | undefined;
  unitLength: number;
  unitNo: string;
  unitDisplay: string;
  addressData: addressDetails;
}
