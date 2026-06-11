// Purchasing Constants

export const PAYMENT_METHODS = [
  "Pix",
  "Boleto Faturado 30 dias",
  "Boleto Faturado 15 dias",
  "Cartão Corporativo",
  "Transferência Bancária"
] as const;

export const PO_STATUS = [
  { value: "ordered", label: "Emitido / Pendente", color: "amber" },
  { value: "delivered", label: "Entregue", color: "emerald" }
] as const;

export const DEFAULT_PAYMENT_METHOD = "Pix";
