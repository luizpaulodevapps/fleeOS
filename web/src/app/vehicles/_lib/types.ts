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
