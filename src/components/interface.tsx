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
  unit: String;
  type: String;
  note: String;
  postal?: String;
  feedback: String;
  status: String;
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
  floors: Array<floorDetails>;
}
