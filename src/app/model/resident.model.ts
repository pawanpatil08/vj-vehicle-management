export interface VehicleEntry {
  owner: string;
  reg: string;
  type: string;
}

export interface Member {
  name: string;
  age: string;
}

export interface Resident {
  id: string;            // synthetic id
  flatNumber: string;
  occupiedBy: string;
  moveInDate: string;
  myGateReg: string;
  primaryName: string;
  primaryMobile: string;
  secondaryName: string;
  secondaryMobile: string;
  totalMembers: string;
  members: Member[];
  vTotal2W: string;
  vTotal4W: string;
  vehicles: VehicleEntry[];
  anyPets: string;
  petType1: string;
  petType2: string;
  dateInserted: string;
  // raw row for searching all fields
  _all: string;
}
