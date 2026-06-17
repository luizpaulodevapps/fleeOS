export interface CompanyForm {
  id: string;
  companyName: string;
  document: string;
  phone: string;
  email: string;
  paymentTerminalMode: "integrated" | "manual";
  plan: string;
}

export interface ProfileForm {
  displayName: string;
  email: string;
}

export interface ProfileFormFields {
  id: string;
  name: string;
  amount: number;
  description: string;
  validFrom: string;
  validTo: string;
}

export interface RuleFormFields {
  id: string;
  profileId: string;
  calendarId: string;
  weekdays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  exemptHolidays: boolean;
  exemptOptionalDays: boolean;
  active: boolean;
}

export interface CalendarFormFields {
  id: string;
  date: string;
  name: string;
  type: "holiday" | "optional" | "maintenance" | "company_shutdown";
  chargeNormally: boolean;
}

export interface SuspensionFormFields {
  id: string;
  driverId: string;
  startDate: string;
  endDate: string;
  reason: string;
  suspendCharges: boolean;
}

export interface SimIndividual {
  driverId: string;
  startDate: string;
  endDate: string;
}

export interface SimBulk {
  startDate: string;
  endDate: string;
}

export interface NewRoleForm {
  name: string;
  description: string;
}
