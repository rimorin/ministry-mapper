import { User } from "firebase/auth";

export interface unitDetails {
  number: string;
  note: string;
  type: string;
  status: string;
  nhcount: string;
  languages: string;
  dnctime: number;
  sequence?: number;
  propertyPostal?: string;
}

export interface nothomeProps {
  nhcount?: string;
  classProp?: string;
}

export interface floorDetails {
  floor: string;
  units: Array<unitDetails>;
}

export interface unitProps {
  type: string;
  note?: string;
  status: string;
  nhcount?: string;
  languages?: string;
  trackRace?: boolean;
  trackLanguages?: boolean;
}

export interface valuesDetails {
  floor: string;
  floorDisplay?: string;
  unit: string;
  unitDisplay?: string;
  type: string;
  note: string;
  languages?: string;
  postal?: string;
  feedback: string;
  status: string;
  link?: string;
  nhcount?: string;
  name?: string;
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

export interface adminProps {
  user: User;
}

export interface territoryDetails {
  code: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addresses: any;
}

export interface addressDetails {
  assigneeCount: number;
  personalCount: number;
  x_zip: string;
  name: string;
  postalcode: string;
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
}

export interface FloorProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  changeValue: number;
}

export interface TitleProps {
  floor: string;
  unit: string;
  postal?: string;
  type?: number;
  name: string;
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

export interface RouteDetails {
  postalCode: string;
  name: string;
}

export interface Policy {
  isCountable(unit: unitDetails): boolean;
  isCompleted(unit: unitDetails): boolean;
  getUnitColor(unit: unitDetails, progress: number): string;
  getHomeLanguage(): string;
  getMaxTries(): number;
}

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

export interface floorHeaderProp {
  floor: string;
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

export interface territoryTableProps {
  floors: floorDetails[];
  maxUnitNumberLength: number;
  policy: Policy | undefined;
  completedPercent: {
    completedValue: number;
    completedDisplay: string;
  };
  trackRace: boolean;
  trackLanguages: boolean;
  postalCode: string;
  adminUnitHeaderStyle?: string;
  userAccessLevel?: number;
  territoryType?: number;
  handleUnitStatusUpdate: (event: React.MouseEvent<HTMLElement>) => void;
  handleUnitNoUpdate?: (event: React.MouseEvent<HTMLElement>) => void;
  handleFloorDelete?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface territoryLandedProps {
  isAdmin: boolean;
  houses: floorDetails;
  policy: Policy | undefined;
  completedPercent: {
    completedValue: number;
    completedDisplay: string;
  };
  trackRace: boolean;
  trackLanguages: boolean;
  postalCode: string;
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

export interface userDetails {
  uid: string;
  name: string;
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

export interface UserModalProps {
  email?: string | null;
  uid?: string;
  congregation: string | undefined;
  name?: string;
  role?: number | undefined;
  footerSaveAcl: number | undefined;
}
