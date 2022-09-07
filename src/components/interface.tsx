import { User } from "firebase/auth";

export interface unitDetails {
  number: String;
  note: String;
  type: String;
  status: String;
}

export interface floorDetails {
  floor: String;
  units: Array<unitDetails>;
}

export interface unitProps {
  type: String;
  note?: String;
  status: String;
}

export interface valuesDetails {
  floor: String;
  floorDisplay?: String;
  unit: String;
  unitDisplay?: String;
  type: String;
  note: String;
  postal?: String;
  feedback: String;
  status: String;
}

export interface adminProps {
  user?: User;
  isConductor?: boolean;
  userType?: String;
}

export interface territoryDetails {
  code: String;
  name: String;
  addresses: any;
}

export interface addressDetails {
  name: String;
  postalcode: String;
  floors: Array<floorDetails>;
  feedback: String;
}

export interface FormProps {
  handleChange?: (event: React.ChangeEvent<HTMLElement>) => void;
  changeValue: string;
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
}

export interface LegendProps {
  showLegend: boolean;
  hideFunction: any;
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
