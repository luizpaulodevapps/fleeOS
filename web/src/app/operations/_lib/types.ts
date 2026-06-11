export interface ChecklistItems {
  taximetro: boolean;
  luminoso: boolean;
  chaveReserva: boolean;
  crlv: boolean;
  extintor: boolean;
  triangulo: boolean;
  macaco: boolean;
  rastreador: boolean;
}

export interface DamagesState {
  dianteira: boolean;
  traseira: boolean;
  lateralEsquerda: boolean;
  lateralDireita: boolean;
  interior: boolean;
}

export interface PhotosState {
  frente: string;
  traseira: string;
  painel: string;
  odometro: string;
}

export interface DeliveryFormState {
  driverId: string;
  vehicleId: string;
  dailyProfileId: string;
  pricingCategoryId: string;
  packageId: string;
  billingProfileId: string;
  pricingTableId: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  initialPayment: number;
  paymentMethod: string;
  signatureText: string;
  signatureImage: string;
  checklist: ChecklistItems;
  mileage: string;
  fuelLevel: string;
  damages: DamagesState;
  damageNotes: string;
  photos: PhotosState;
}

export interface ReturnFormState {
  vehicleId: string;
  endDate: string;
  checklist: ChecklistItems;
  mileage: string;
  fuelLevel: string;
  vehicleStatusAfter: "active" | "maintenance" | "sinistrado";
  damages: DamagesState;
  damageNotes: string;
  dailyCharges: number;
  fuelCharge: number;
  damageCharge: number;
  deductFromDeposit: boolean;
  signatureText: string;
  signatureImage: string;
  photos: PhotosState;
}

export interface SwapFormState {
  driverId: string;
  oldVehicleId: string;
  newVehicleId: string;
  swapDate: string;
  oldMileage: string;
  oldFuelLevel: string;
  oldChecklist: ChecklistItems;
  oldDamages: DamagesState;
  oldDamageNotes: string;
  newMileage: string;
  newFuelLevel: string;
  newChecklist: ChecklistItems;
  signatureText: string;
  signatureImage: string;
  chargeExtraFee: boolean;
  extraFeeAmount: number;
}
