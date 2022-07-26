import { User } from "firebase/auth";

export interface unitDetails {
  number: String;
  note: String;
  type: String;
  status: String;
  nhcount: String;
  languages: String;
  dnctime: number;
  sequence?: number;
}

export interface nothomeprops {
  nhcount?: String;
  classProp?: String;
}

export interface floorDetails {
  floor: String;
  units: Array<unitDetails>;
}

export interface unitProps {
  type: String;
  note?: String;
  status: String;
  nhcount?: String;
  languages?: String;
  trackRace?: boolean;
  trackLanguages?: boolean;
}

export interface valuesDetails {
  floor: String;
  floorDisplay?: String;
  unit: String;
  unitDisplay?: String;
  type: String;
  note: String;
  languages?: String;
  postal?: String;
  feedback: String;
  status: String;
  link?: String;
  nhcount?: String;
  name?: String;
  units?: String;
  floors?: number;
  newPostal?: String;
  code?: String;
  dnctime?: number;
  sequence?: number;
  unitlength?: number;
}

export interface adminProps {
  user: User;
}

export interface territoryDetails {
  code: String;
  name: String;
  addresses: any;
}

export interface addressDetails {
  x_zip: String;
  name: String;
  postalcode: String;
  floors: Array<floorDetails>;
  feedback: String;
}

export interface FormProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  handleChangeValues?: (values: any[]) => void;
  handleDateChange?: (date: Date) => void;
  changeDate?: number;
  changeValue?: string;
  changeValues?: string[];
  name?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export interface FloorProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  changeValue: number;
}

export interface TitleProps {
  floor: String;
  unit: String;
  postal?: String;
}

export interface BrandingProps {
  naming: String;
}

export interface FooterProps {
  handleClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isSaving?: boolean;
  userAccessLevel?: number;
}

export interface LegendProps {
  showLegend: boolean;
  hideFunction?: any;
}

export interface TerritoryListingProps {
  showListing: boolean;
  hideFunction: any;
  selectedTerritory?: String;
  handleSelect?: (
    eventKey: string | null,
    e: React.SyntheticEvent<unknown>
  ) => void;
  territories?: territoryDetails[];
}

export interface LoginProps {
  loginType: String;
}

export interface unitMaps {
  [key: string]: Object;
}

export interface RouteDetails {
  postalCode: String;
  name: String;
}

export interface Policy {
  isCountable(unit: unitDetails): boolean;
  isCompleted(unit: unitDetails): boolean;
}

export interface AuthorizerProp {
  requiredPermission: number;
  userPermission: number | undefined;
  children: React.ReactElement;
}
