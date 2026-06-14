"use client";

export const PAYMENT_METHODS = [
  { id: "pix", label: "Pix" },
  { id: "card", label: "Cartão Débito/Crédito" },
  { id: "cash", label: "Dinheiro Físico" },
  { id: "transfer", label: "Transferência Bancária" }
] as const;

export const GATEWAY_PROVIDERS = [
  { id: "mercado_pago", label: "Mercado Pago" },
  { id: "stripe", label: "Stripe" },
  { id: "asaas", label: "Asaas" },
  { id: "manual", label: "Lançamento Manual" }
] as const;

export const TRANSACTION_STATUSES = [
  { id: "pending", label: "Pendente" },
  { id: "approved", label: "Aprovado" },
  { id: "voided", label: "Cancelado / Estornado" },
  { id: "failed", label: "Falhou" }
] as const;

export const SCORE_GRADES = [
  { grade: "AAA", minScore: 900, label: "Excelente" },
  { grade: "AA", minScore: 800, label: "Muito Bom" },
  { grade: "A", minScore: 650, label: "Bom" },
  { grade: "B", minScore: 500, label: "Médio" },
  { grade: "C", minScore: 350, label: "Ruim" },
  { grade: "D", minScore: 0, label: "Risco Alto" }
] as const;
