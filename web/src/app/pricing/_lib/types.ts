export interface CategoryFormState {
  code: string;
  name: string;
  description: string;
}

export interface TableFormState {
  name: string;
  description: string;
  active: boolean;
}

export interface RateFormState {
  tableId: string;
  categoryId: string;
  billingFrequency: string;
  amount: number;
}

export interface CalendarFormState {
  date: string;
  pricingTableId: string;
  description: string;
  type: string;
  priority: number;
}

export interface PackageFormState {
  name: string;
  pricingCategoryId: string;
  includedKm: number;
  extraKmPrice: number;
  includedServicesText: string;
  allowReserveVehicle: boolean;
  roadsideAssistance: boolean;
}

export interface ExemptionFormState {
  driverId: string;
  exemptionType: string;
  percentage: number;
  validUntil: string;
}
