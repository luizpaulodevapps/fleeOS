export interface Driver {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  condutax: string;
  condutaxExpiration: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhExpiration: string;
  cnhPoints: number;
  cnhPointsUpdatedAt: string;
  cnhSuspended: boolean;
  cnhObservation: string;
  address: string;
  emergencyContact: string;
  photoUrl: string;
  status: string;
  birthDate: string;
  civilStatus: string;
  notes: string;
  admissionDate: string;
  exitDate: string;
  activeLocks: string[];
  lockJustification: Record<string, string>;
  archivedAt?: string;
}

export interface Attachment {
  id?: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
}

export interface Occurrence {
  id?: string;
  driverId: string;
  type: string;
  description: string;
  date: string;
  reportedBy: string;
}

export interface Infraction {
  id?: string;
  driverId: string;
  date: string;
  ait: string;
  agency: string;
  vehicleId: string;
  points: number;
  amount: number;
  description: string;
  responsible: string;
  status: string;
}

export interface LedgerEntry {
  id?: string;
  driverId: string;
  type: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface DriverFormData {
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  condutax: string;
  condutaxExpiration: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhExpiration: string;
  cnhPoints: number;
  cnhPointsUpdatedAt: string;
  cnhSuspended: boolean;
  cnhObservation: string;
  address: string;
  emergencyContact: string;
  photoUrl: string;
  status: string;
  birthDate: string;
  civilStatus: string;
  notes: string;
  admissionDate: string;
  exitDate: string;
}

export interface InfractionFormData {
  date: string;
  ait: string;
  agency: string;
  vehicleId: string;
  points: number;
  amount: string;
  description: string;
  responsible: string;
  status: string;
}

export interface OccurrenceFormData {
  type: string;
  description: string;
  reportedBy: string;
}

export interface DocFormData {
  fileName: string;
  fileUrl: string;
}

export interface LedgerFormData {
  type: string;
  description: string;
  amount: string;
}
