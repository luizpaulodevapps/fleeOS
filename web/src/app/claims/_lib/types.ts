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
}

export interface BudgetForm {
  workshopName: string;
  amount: number;
  description: string;
  attachmentUrl: string;
}
