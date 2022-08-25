import { User } from "firebase/auth";

export interface homeProps {
  postalcode?: String;
  name?: String;
}

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
  congregationCode: String;
  user?: User;
  isConductor?: boolean;
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
