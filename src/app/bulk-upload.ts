/**
 * Bulk upload runner (JSON/CSV -> Firestore) must run in Node, not in Angular.
 *
 * This file is intentionally kept free of Node-only imports (`fs`, `path`).
 * Use `upload-residents.mjs` (Node) to perform the actual Firestore writes.
 */

export type VehicleEntry = {
  owner: string;
  reg: string;
  type: string;
};

export type Member = {
  name: string;
  age: string;
};

export type Resident = {
  id?: string;
  flatNumber: string;
  occupiedBy: string;
  moveInDate?: string;
  myGateReg?: string;
  primaryName: string;
  primaryMobile: string;
  secondaryName?: string;
  secondaryMobile?: string;
  totalMembers?: string;
  members?: Member[];
  vTotal2W?: string;
  vTotal4W?: string;
  vehicles?: VehicleEntry[];
  anyPets?: string;
  petType1?: string;
  petType2?: string;
  dateInserted?: string;
  _all?: string;
};

export function normalizeResidentForFirestore(resident: Resident): Omit<Resident, 'id' | '_all'> & { createdAt: string } {
  const cleanedVehicles = (resident.vehicles || [])
    .filter((v) => (v.reg || '').trim())
    .map((v) => ({ owner: (v.owner || '').trim(), reg: (v.reg || '').trim(), type: (v.type || '').trim() }));

  const cleanedMembers = (resident.members || [])
    .filter((m) => (m.name || '').trim())
    .map((m) => ({ name: (m.name || '').trim(), age: (m.age || '').trim() }));

  return {
    ...(resident as any),
    occupiedBy: (resident.occupiedBy || '').trim(),
    flatNumber: (resident.flatNumber || '').trim(),
    primaryName: (resident.primaryName || '').trim(),
    primaryMobile: (resident.primaryMobile || '').trim(),
    secondaryName: (resident.secondaryName || '').trim() || undefined,
    secondaryMobile: (resident.secondaryMobile || '').trim() || undefined,
    totalMembers: (resident.totalMembers || '').trim() || undefined,
    vTotal2W: (resident.vTotal2W || '').trim() || undefined,
    vTotal4W: (resident.vTotal4W || '').trim() || undefined,
    anyPets: (resident.anyPets || '').trim() || undefined,
    members: cleanedMembers,
    vehicles: cleanedVehicles,
    myGateReg: (resident.myGateReg || 'YES').trim(),
    moveInDate: resident.moveInDate || '',
    petType1: resident.petType1 || '',
    petType2: resident.petType2 || '',
    dateInserted: resident.dateInserted || new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
  };
}
