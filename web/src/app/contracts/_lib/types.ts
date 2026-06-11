export type ContractStatus = "Rascunho" | "Ativo" | "Suspenso" | "Encerrado" | "Rescindido";
export type ContractType = "Locação" | "Comodato" | "Substituição" | "Temporário";
export type PaymentMethod = "Dinheiro" | "PIX" | "Débito" | "Crédito" | "Cheque";
export type PromissoryStatus = "Pendente" | "Compensado" | "Devolvido" | "Cancelado";

export type ChecklistItemForm = { label: string; checked: boolean; obs: string };

export type EditFormState = {
  status: ContractStatus;
  type: ContractType;
  startDate: string;
  endDate: string;
  dailyRate: string;
  weeklyRate: string;
  monthlyRate: string;
  notes: string;
};

export type NewContractFormState = {
  driverId: string;
  vehicleId: string;
  templateId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  dailyProfileId: string;
  billingRuleId: string;
  type: ContractType;
  signatureToken: string;
  notes: string;
};

export type ReceiptFormState = {
  date: string;
  amount: string;
  period: string;
  type: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

export type PromissoryFormState = {
  promissoryNumber: string;
  dueDate: string;
  amount: string;
  description: string;
  checkNumber: string;
  bankName: string;
  status: string;
};

export type AddendumFormState = {
  type: string;
  description: string;
  newEndDate: string;
  newDailyRate: string;
  signatureToken: string;
};

export type CloseFormState = {
  amountPaid: number;
  notes: string;
};

export type ContractMetrics = {
  active: number;
  suspended: number;
  revenue: number;
  pendingProm: number;
  expiring: number;
};
