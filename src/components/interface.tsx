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
}

export interface valuesDetails {
  floor: String;
  unit: String;
  done?: boolean;
  dnc?: boolean;
  type: string;
  note: string;
  postal?: String;
}
