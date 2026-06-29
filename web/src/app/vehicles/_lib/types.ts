export interface SpecsFormState {
  plate: string;
  model: string;
  brand: string;
  year: number;
  renavam: string;
  chassis: string;
  color: string;
  fuelType: string;
  mileage: number;
  insuranceExpiration: string;
  registrationExpiration: string;
  status: string;
  photoUrl: string;
  family?: string;
  pricingCategoryId?: string;
  maintenanceGroup?: string;
  maintenancePlanId?: string;
  fipe?: {
    code: string;
    value: number;
    referenceMonth: string;
  };
  lastFipeUpdate?: string;
}

export interface AcquisitionFormState {
  acquisitionType: string;
  purchaseDate: string;
  purchaseValue: string;
  fipeAtPurchase: string;
  seller: string;
  invoiceNumber: string;
  bankName: string;
  contractNumber: string;
  financedAmount: string;
  downPayment: string;
  installments: string;
  installmentValue: string;
  interestRate: string;
  startDate: string;
  leasingCompany: string;
  leasingMonths: string;
  leasingMonthlyValue: string;
  leasingBuyOption: string;
  ownerName: string;
  ownerDocument: string;
  comodatoContract: string;
  comodatoMonths: string;
  monthlyRepasse: string;
  currentFipeValue: string;
  fipeConsultDate: string;
  annualInsuranceCost: string;
  annualIpvaCost: string;
  admissionMileage: string;
  notes: string;

  // Taxes / Licensing / Inspections
  annualLicensingCost?: string;
  annualInspectionCost?: string;
  ipvaExpirationDate?: string;
  licensingExpirationDate?: string;
  inspectionExpirationDate?: string;
  ipvaPaidStatus?: "paid" | "pending";
  licensingPaidStatus?: "paid" | "pending";
  inspectionPaidStatus?: "paid" | "pending";

  // Taxi credentials / licensing
  isTaxi?: boolean;
  alvaraNumber?: string;
  alvaraExpirationDate?: string;
  alvaraRenewalCost?: string;
  municipalInspectionStatus?: "approved" | "pending" | "failed";

  // Initial Preparation Setup Costs
  taximeterCost?: string;
  rooftopLightCost?: string;
  initialInspectionCost?: string;
  paintOrDecalCost?: string;
  municipalRegistrationCost?: string;
  otherInitialCosts?: string;
}

export interface AssetFormState {
  assetType: string;
  serialNumber: string;
  installDate: string;
  status: string;
}

export interface IncidentFormState {
  driverId: string;
  date: string;
  description: string;
  severity: "Leve" | "Média" | "Grave";
  repairCost: string;
  photoUrl: string;
}

export interface MaintFormState {
  type: string;
  description: string;
  cost: string;
  date: string;
  mileage: string;
  nextMaintenanceMileage: string;
}

export interface DocFormState {
  fileName: string;
  fileUrl: string;
}

export interface TaximeterHistoryEntry {
  date: string;
  type: "installation" | "swap" | "maintenance" | "calibration";
  description: string;
}

export interface TaximeterRegistry {
  id?: string;
  vehicleId: string;
  brand: string;
  model: string;
  serialNumber: string;
  ipemSeal: string;
  calibrationDate: string;
  validUntil: string;
  history: TaximeterHistoryEntry[];
}

export interface GnvDetails {
  hasGnv: boolean;
  cylinderSerial: string;
  cylinderManufacturer: string;
  cylinderCapacity: string;
  cylinderMfgDate: string;
  cylinderInstallDate: string;
  cylinderLastInspection: string;
  cylinderExpiry: string;
}

export interface DecommissioningChecklist {
  contractClosed: boolean;
  taximeterRemoved: boolean;
  permitCancelled: boolean;
  dtpUpdated: boolean;
  finesPaid: boolean;
  debtsPaid: boolean;
  docsReleased: boolean;
}

export interface RegulatoryChecklist {
  invoice: boolean;
  crv: boolean;
  renavam: boolean;
  taximeterInstalled: boolean;
  taximeterCalibrated: boolean;
  permitIssued: boolean;
  insuranceActive: boolean;
  trackerInstalled: boolean;
  dtpInspectionApproved: boolean;
}

export interface AlvaraDetails {
  alvaraNumber: string;
  validUntil: string;
  holderName: string;
  cnhCategory: string;
  address: string;
  condutax: string;
  authorizedDriver2?: string;
  parkingStation?: string;
  taxExemption?: string; // IPI/ICMS
  publicity?: string;
  issueDate?: string;
  formNumber?: string;
  smtObservation?: string;
  digitalCopyUrl?: string;
}

export interface CompanyDetails {
  companyName: string;
  cnpj: string;
  dtpRegistration: string;
  radioTaxiName?: string;
  radioTaxiLogoUrl?: string;
}

export interface VehicleRegulatoryProcess {
  id?: string;
  vehicleId: string;
  city: string;
  operationType: string;
  status: string; // lifecycle status
  checklist: RegulatoryChecklist;
  gnvDetails: GnvDetails;
  decommissioningChecklist?: DecommissioningChecklist;
  decommissionedAt?: string;
  decommissionedBy?: string;
  alvaraDetails?: AlvaraDetails;
  companyDetails?: CompanyDetails;
}

export interface RegulatoryInspection {
  id?: string;
  vehicleId: string;
  type: "alvara" | "gnv" | "taximetro" | "inmetro" | "licenciamento" | "seguros";
  validUntil: string;
  lastInspectionDate: string;
  status: "valid" | "expired" | "warning";
  notes?: string;
}

export interface MunicipalRegulation {
  id?: string;
  city: string;
  requiresTaxiMeter: boolean;
  requiresPermitInspection: boolean;
  requiresGnvInspection: boolean;
}

export interface PermitHistoryEntry {
  date: string;
  vehicleId?: string | null;
  action: string;
}

export interface Permit {
  id?: string;
  tenantId?: string;
  permitNumber: string;
  ownerId: string;
  ownerName: string;
  currentVehicleId: string | null;
  pointId?: string | null;
  permissionHolder?: string;
  expirationDate?: string;
  status: "active" | "inactive" | "suspended" | "transferred" | "available" | "linked" | "deposited" | "deregistered";
  history?: PermitHistoryEntry[];
}

export interface TaxiPoint {
  id?: string;
  tenantId?: string;
  code: string;
  name: string;
  address?: string;
  expirationDate: string;
  status: "active" | "inactive" | "expired";
}

export interface RegulatoryDispatcher {
  id?: string;
  tenantId?: string;
  name: string;
  type: "company" | "internal";
  phone?: string;
  email?: string;
  status: "active" | "inactive";
}

export interface PermitRegulatoryProcess {
  id?: string;
  tenantId?: string;
  permitId: string;
  oldVehicleId?: string | null;
  newVehicleId?: string | null;
  processType: "replacement" | "accreditation" | "deaccreditation";
  status: "open" | "in_progress" | "waiting" | "blocked" | "completed" | "cancelled";
  stage: string;
  workOrderNumber: string;
  dispatcherId?: string | null;
  responsibleUser?: string;
  deadline?: string;
  estimatedCost?: number;
  actualCost?: number;
  checklist: Record<string, boolean>;
  createdAt?: string;
  completedAt?: string;
}

export interface DriverRegulatory {
  id?: string;
  tenantId?: string;
  driverId: string;
  condutaxNumber: string;
  issueDate: string;
  expirationDate: string;
  status: "active" | "expired" | "blocked_dtp" | "warning";
  cnhExpirationDate: string;
  courseExpirationDate?: string;
  dtpBlocked: boolean;
  observations?: string;
}

export interface Infraction {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  driverId?: string;
  autoNumber: string;
  orgao: string;
  description: string;
  valor: number;
  pontuacao: number;
  vencimento: string;
  responsavel: "driver" | "company" | "undetermined";
  status: "pending" | "transferred" | "appealed" | "paid" | "installments";
  createdAt?: string;
}

export interface VehicleLifecycleProcess {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  operationType: "taxi" | "app" | "corporate" | "van";
  phase: "entry" | "operation" | "exit";
  step: string; // e.g. "compra", "nf_crv_renavam", "taximetro", "gnv", "dtp", "homologation", "active", "decommissioned"
  status: "pending" | "in_progress" | "completed" | "blocked";
  startedAt: string;
  completedAt?: string;
  assignedDispatcher?: string;
  checklistCompletion: number; // 0-100
}

export interface VehicleComplianceScore {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  score: number; // 0-100
  status: "excellent" | "warning" | "critical";
  lastCalculated: string;
}

export interface AnnualInspection {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  damspPaid: boolean;
  inspectionDate: string;
  oiaNumber: string;
  result: "approved" | "rejected";
  reportFileUrl?: string;
  permitIssued: boolean;
  year: number;
}

export interface TaximeterAdjustment {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  tariffVersion: string;
  adjustmentDate: string;
  workshop: string;
  status: "pending" | "completed";
}

export interface GnvRegistry {
  id?: string;
  tenantId?: string;
  vehicleId: string;
  cylinderNumber: string;
  installationCompany: string;
  certificationDate: string;
  expirationDate: string;
  status: "valid" | "expired" | "warning";
}
