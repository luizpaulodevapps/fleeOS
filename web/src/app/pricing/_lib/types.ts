export interface CategoryFormState {
  code: string;
  name: string;
  description: string;
  operationTypeId?: string; // Optional operation type binding (taxi, corporate, etc.)
}

export interface SubcategoryFormState {
  categoryId: string;
  code: string;
  name: string;
  description: string;
  amountOverride?: number; // Nullable override value
}

export interface OperationFormState {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface TableFormState {
  name: string;
  description: string;
  active: boolean;
}

export interface RateFormState {
  tableId: string;
  categoryId: string;
  subcategoryId?: string; // Optional subcategory override
  billingFrequency: string;
  amount: number;
}

export interface CalendarFormState {
  date: string;
  pricingTableId: string;
  description: string;
  type: string; // 'holiday' | 'event' | 'promo'
  priority: number;
  action: string; // 'exempt' | 'surcharge' | 'discount'
  value: number; // multiplier (e.g. 1.25) or flat offset
}

export interface PackageFormState {
  name: string;
  pricingCategoryId: string;
  includedKm: number;
  extraKmPrice: number;
  includedServicesText: string;
  allowReserveVehicle: boolean;
  roadsideAssistance: boolean;
  operationTypeId?: string; // Optional operation type binding
}

export interface ExemptionFormState {
  name: string;
  targetType: "driver" | "contract" | "vehicle" | "category";
  targetId: string; // ID of the driver, contract, vehicle, or category
  exemptionType: "percentage" | "fixed" | "free_days";
  percentage: number;
  value: number;
  freeDaysCount: number;
  validUntil: string;
}

export interface PromotionFormState {
  name: string;
  pricingCategoryId: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

export interface ContractTypeFormState {
  id: string;
  name: string;
  billingProfileId: string;
  defaultFrequency: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  allowExemptions: boolean;
  allowHolidayRules: boolean;
  operationTypeId: string; // Link to taxi, corporate, etc.
}

export interface BillingProfileFormState {
  id: string;
  name: string;
  frequency: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  chargeDays: string[]; // e.g. ['monday', 'tuesday'...]
  holidayPolicy: "exempt" | "ignore" | "surcharge";
  lateFeePercent: number;
  graceDays: number;
}

export interface TableVersionFormState {
  tableId: string;
  version: number;
  changeDescription: string;
  changedBy: string;
  createdAt: string;
}
