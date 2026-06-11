import { CHECKLIST_ITEMS_DEFAULT } from "./constants";
import type { ContractType, PaymentMethod } from "./types";
import { STATUS_ALIASES } from "./constants";
import type { ContractStatus } from "./types";

export const normalizeContractStatus = (status: string): ContractStatus =>
  STATUS_ALIASES[status] || (status as ContractStatus);

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
};

export const createDefaultChecklistItems = () =>
  CHECKLIST_ITEMS_DEFAULT.map((label) => ({ label, checked: false, obs: "" }));

export const createDefaultNewContractForm = () => ({
  driverId: "",
  vehicleId: "",
  templateId: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  dailyRate: 150,
  dailyProfileId: "",
  billingRuleId: "",
  type: "Locação" as ContractType,
  signatureToken: "",
  notes: "",
});

export const createDefaultReceiptForm = () => ({
  date: new Date().toISOString().split("T")[0],
  amount: "",
  period: "",
  type: "Mensal",
  paymentMethod: "PIX" as PaymentMethod,
  notes: "",
});

export const createDefaultPromissoryForm = () => ({
  promissoryNumber: "",
  dueDate: "",
  amount: "",
  description: "",
  checkNumber: "",
  bankName: "",
  status: "Pendente",
});

export const createDefaultAddendumForm = () => ({
  type: "Renovação",
  description: "",
  newEndDate: "",
  newDailyRate: "",
  signatureToken: "",
});
