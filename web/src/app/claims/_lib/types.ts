export interface Claim {
  id: string;
  tenantId: string;
  claimNumber: string;
  vehicleId: string;
  driverId: string;
  contractId: string;
  occurrenceDate: string;
  status: string;
  severity: "light" | "medium" | "severe" | "total_loss";
  location: string;
  description: string;
  involvedThirdParties: boolean;
  hasVictims: boolean;
  vehicleDrivable: boolean;
  createdBy: string;
  createdAt: string;

  // Digital Dossier fields
  lat?: number;
  lng?: number;
  culprit?: "driver" | "third_party" | "none" | "unknown";
  accidentReason?: string;
  accidentDynamics?: string;
  sha256Fingerprint?: string;
  isFrozen?: boolean;

  // Battida Checklist States
  startsEngine?: boolean;
  vehicleMoves?: boolean;
  steeringOk?: boolean;
  brakesOk?: boolean;
  coolingSystemOk?: boolean;
  electricalSystemOk?: boolean;
  airbagsDeployed?: boolean;
  fluidLeak?: boolean;
  suspensionDamage?: boolean;
  wheelDamage?: boolean;
  windshieldDamage?: boolean;
  headlightDamage?: boolean;

  // Operation tow/reserve fields
  needsTowTruck?: boolean;
  towTruckRequested?: boolean;
  vehicleCanContinue?: boolean;
  reserveVehicleRequired?: boolean;
  reserveVehicleAssigned?: boolean;
  reserveVehicleId?: string;
  reserveAssignmentId?: string;

  // Accident Type
  accidentType?: string;
  damageMap?: Array<{ region: string; severity: string; description: string }>;
}

export interface ClaimChecklist {
  id?: string;
  claimId: string;
  frontPhotos: boolean;
  rearPhotos: boolean;
  sidePhotos: boolean;
  dashboardPhoto: boolean;
  odometerPhoto: boolean;
  crlvAttached: boolean;
  cnhAttached: boolean;
  updatedAt: string;
}

export interface ClaimEvidence {
  id: string;
  claimId: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ClaimReport {
  id?: string;
  claimId: string;
  reportNumber: string;
  policeStation: string;
  reportDate: string;
  attachmentUrl: string;
}

export interface ClaimThirdParty {
  id?: string;
  claimId: string;
  name: string;
  cpf: string;
  phone: string;
  plate: string;
  vehicle: string;
  insurer: string;
  policyNumber?: string;
}

export interface ClaimDamageItem {
  id: string;
  claimId: string;
  item: string;
  severity: string;
  estimatedCost: number;
}

export interface ClaimBudget {
  id: string;
  claimId: string;
  workshopName: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  attachmentUrl: string;
}

export interface ClaimInstallment {
  id?: string;
  claimId: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  createdAt: string;
}

export interface ClaimApproval {
  id?: string;
  claimId: string;
  role: string;
  status: "approved" | "rejected";
  approvedBy: string;
  approvedAt: string;
  comments: string;
}

export interface ClaimPoliceReport {
  id?: string;
  claimId: string;
  protocolNumber: string;
  reportNumber: string;
  year: string;
  declarantCpf: string;
  declarantName: string;
  status: "Não Registrado" | "Aguardando Registro" | "Em Análise" | "Complementação Solicitada" | "Concluído";
  registrationDate: string;
  lastCheckDate: string;
  observations: string;
  boPdf?: string;
  boReceipt?: string;
  boUrl?: string;
}

export interface ClaimInsurance {
  id?: string;
  claimId: string;
  insuranceCompany: string;
  policyNumber: string;
  claimNumber: string;
  adjusterName: string;
  adjusterPhone: string;
  deductibleAmount: number;
  approvedAmount: number;
  deniedAmount: number;
  expectedPaymentDate: string;
  receivedAmount: number;
  receivedDate: string;
}

export interface ClaimFinancialRecovery {
  id?: string;
  claimId: string;
  repairCost: number;
  deductible: number;
  insuranceCoverage: number;
  driverCharge: number;
  thirdPartyCharge: number;
  responsible: "Motorista" | "Terceiro" | "Seguradora" | "Compartilhado";
}

export interface ClaimTimelineEvent {
  id?: string;
  claimId: string;
  eventType: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface NewClaimForm {
  vehicleId: string;
  driverId: string;
  occurrenceDate: string;
  severity: "light" | "medium" | "severe" | "total_loss";
  location: string;
  description: string;
  involvedThirdParties: boolean;
  hasVictims: boolean;
  vehicleDrivable: boolean;

  // New fields from refined specs
  startsEngine?: boolean;
  vehicleMoves?: boolean;
  steeringOk?: boolean;
  brakesOk?: boolean;
  coolingSystemOk?: boolean;
  electricalSystemOk?: boolean;
  airbagsDeployed?: boolean;
  fluidLeak?: boolean;
  suspensionDamage?: boolean;
  wheelDamage?: boolean;
  windshieldDamage?: boolean;
  headlightDamage?: boolean;

  needsTowTruck?: boolean;
  towTruckRequested?: boolean;
  vehicleCanContinue?: boolean;
  reserveVehicleRequired?: boolean;
  accidentType?: string;
  damageMap?: Array<{ region: string; severity: string; description: string }>;

  // Third party nested form for initial triage
  thirdPartyName?: string;
  thirdPartyPhone?: string;
  thirdPartyVehicle?: string;
  thirdPartyPlate?: string;
  thirdPartyInsurer?: string;
  thirdPartyPolicyNumber?: string;
  evidencePhotos?: Array<{ fileType: string; fileUrl: string }>;

  // Initial geoloc & dynamic occurrence info
  lat?: number;
  lng?: number;
  culprit?: "driver" | "third_party" | "none" | "unknown";
  accidentReason?: string;
  accidentDynamics?: string;

  // Wizard initial BO parameters
  boProtocolNumber?: string;
  boReportNumber?: string;
  boYear?: string;
  boDeclarantCpf?: string;
  boDeclarantName?: string;
  boStatus?: string;
  boObservations?: string;
  boPdf?: string;
  boReceipt?: string;
  boUrl?: string;
}

export interface ChecklistForm {
  frontPhotos: boolean;
  rearPhotos: boolean;
  sidePhotos: boolean;
  dashboardPhoto: boolean;
  odometerPhoto: boolean;
  crlvAttached: boolean;
  cnhAttached: boolean;
}

export interface BoForm {
  reportNumber: string;
  policeStation: string;
  reportDate: string;
  attachmentUrl: string;
}

export interface TpForm {
  name: string;
  cpf: string;
  phone: string;
  plate: string;
  vehicle: string;
  insurer: string;
  policyNumber?: string;
}

export interface BudgetForm {
  workshopName: string;
  amount: number;
  description: string;
  attachmentUrl: string;
}

// 2.0 digital dossier collections
export interface ClaimAuditLog {
  id: string;
  claimId: string;
  field: string;
  oldValue: string;
  newValue: string;
  hash: string;
  createdBy: string;
  createdAt: string;
}

export interface ClaimEvidenceChain {
  id: string;
  claimId: string;
  evidenceId: string;
  uploadedBy: string;
  uploadedAt: string;
  device: string;
  gps: { lat: number; lng: number };
  fileHash: string;
}

export interface ClaimRiskAnalysis {
  id: string;
  claimId: string;
  riskScore: number;
  flags: string[];
  status: "clear" | "suspicious" | "under_review" | "approved";
  analyzedAt: string;
}

export interface ClaimVersion {
  id: string;
  claimId: string;
  versionNumber: number;
  snapshot: string; // JSON serialized claim model
  changedBy: string;
  changedAt: string;
  changeReason: string;
}

export interface ClaimRecoveryCase {
  id: string;
  claimId: string;
  lawsuitNumber: string;
  attorneyName: string;
  responsibleParty: string;
  legalCosts: number;
  settlementAmount: number;
  status: "ongoing" | "settled" | "appealed";
  createdAt: string;
}
