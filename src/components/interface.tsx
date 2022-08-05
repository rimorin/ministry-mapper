export interface homeProps {
  postalcode?: String;
  name?: String;
}

export interface unitDetails {
  number: String;
  done: Boolean;
  dnc: Boolean;
  note: String;
  type: String;
  invalid: Boolean;
}

export interface floorDetails {
  floor: String;
  units: Array<unitDetails>;
}

export interface unitProps {
  isDone?: Boolean;
  isDnc?: Boolean;
  type: String;
  note?: String;
  isInvalid?: Boolean;
}

export interface valuesDetails {
  floor: String;
  unit: String;
  done?: boolean;
  dnc?: boolean;
  type: string;
  note: string;
  postal?: String;
  invalid?: boolean;
  feedback: string;
}

export interface adminProps {
  congregationCode: String;
}

export interface territoryDetails {
  code: String;
  name: String;
  addresses: any;
}

export interface addressDetails {
  name: String;
  postalcode: String;
  floors: Array<Object>;
}
