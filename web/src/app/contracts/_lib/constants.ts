import type { ContractStatus } from "./types";

export const STATUS_ALIASES: Record<string, ContractStatus> = {
  active: "Ativo",
  suspended: "Suspenso",
  closed: "Encerrado",
  completed: "Encerrado",
  rescinded: "Rescindido",
  draft: "Rascunho",
};

export const STATUS_STYLES: Record<string, string> = {
  Ativo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25",
  Suspenso: "bg-amber-400/10 text-amber-700 border-amber-400/25",
  Encerrado: "bg-slate-200/80 text-slate-500 border-slate-300",
  Rescindido: "bg-red-500/10 text-red-600 border-red-500/25",
  Rascunho: "bg-blue-500/10 text-blue-600 border-blue-500/25",
};

export const CHECKLIST_ITEMS_DEFAULT = [
  "Carroceria sem amassados ou riscos",
  "Para-choques dianteiro e traseiro intactos",
  "Lanternas e faróis funcionando",
  "Pneus em bom estado (incluindo estepe)",
  "Vidros e espelhos sem trincas",
  "Interior limpo e conservado",
  "Documentos no veículo (CRLV, seguro)",
  "Extintor de incêndio válido",
  "Macaco e chave de roda presentes",
  "Nível de combustível conferido",
  "Ar-condicionado funcionando",
  "Hodômetro registrado",
];

export const CONTRACT_DETAIL_TABS = [
  { id: "overview", label: "Visão Geral" },
  { id: "receipts", label: "Recibos" },
  { id: "promissories", label: "Promissórias" },
  { id: "checklist", label: "Checklist" },
  { id: "addendums", label: "Aditivos" },
  { id: "audit", label: "Auditoria" },
] as const;

export const DRIVER_LOCK_BLOCKS = ["Documentação", "CNH Suspensa", "Financeiro", "Conduta"] as const;
