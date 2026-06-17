"use client";

// ─── Categorias ──────────────────────────────────────────────────────────────

export type FineCategory = "transit" | "dtp" | "operational" | "contractual";

export const FineCategoryLabels: Record<FineCategory, string> = {
  transit: "Trânsito",
  dtp: "DTP / Táxi",
  operational: "Operacional",
  contractual: "Contratual",
};

export const FineCategoryColors: Record<FineCategory, string> = {
  transit: "bg-blue-50 text-blue-700 border-blue-200",
  dtp: "bg-orange-50 text-orange-700 border-orange-200",
  operational: "bg-purple-50 text-purple-700 border-purple-200",
  contractual: "bg-slate-50 text-slate-700 border-slate-200",
};

// ─── Status ───────────────────────────────────────────────────────────────────

export type TrafficFineStatus =
  | "received"
  | "pending_driver_id"
  | "driver_identified"
  | "charged"
  | "appealing"
  | "appeal_granted"
  | "appeal_denied"
  | "installment_plan"
  | "paid"
  | "archived";

export const FineStatusLabels: Record<TrafficFineStatus, string> = {
  received: "Recebida",
  pending_driver_id: "Ag. Identificação",
  driver_identified: "Condutor Identificado",
  charged: "Cobrada",
  appealing: "Em Recurso",
  appeal_granted: "Recurso Procedente",
  appeal_denied: "Recurso Negado",
  installment_plan: "Parcelada",
  paid: "Quitada",
  archived: "Arquivada",
};

export const FineStatusColors: Record<TrafficFineStatus, string> = {
  received: "bg-slate-100 text-slate-700",
  pending_driver_id: "bg-amber-100 text-amber-700",
  driver_identified: "bg-blue-100 text-blue-700",
  charged: "bg-indigo-100 text-indigo-700",
  appealing: "bg-purple-100 text-purple-700",
  appeal_granted: "bg-emerald-100 text-emerald-700",
  appeal_denied: "bg-red-100 text-red-700",
  installment_plan: "bg-cyan-100 text-cyan-700",
  paid: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-500",
};

// ─── Responsável ─────────────────────────────────────────────────────────────

export type ResponsibleParty = "driver" | "company" | "dispatcher" | "shared";

export const ResponsiblePartyLabels: Record<ResponsibleParty, string> = {
  driver: "Motorista",
  company: "Empresa",
  dispatcher: "Despachante",
  shared: "Compartilhado",
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface FineTimelineEvent {
  date: string;
  label: string;
  detail?: string;
  actor?: string;
}

// ─── Recurso ──────────────────────────────────────────────────────────────────

export type AppealType = "1st_instance" | "jari" | "cetran" | "judicial";
export type AppealStatus = "pending" | "granted" | "denied" | "withdrawn";

export interface FineAppeal {
  id: string;
  fineId: string;
  type: AppealType;
  grounds: string;
  submittedAt: string;
  deadline: string;
  status: AppealStatus;
  result?: string;
  attachments?: string[];
  createdAt: string;
}

export const AppealTypeLabels: Record<AppealType, string> = {
  "1st_instance": "1ª Instância",
  jari: "JARI",
  cetran: "CETRAN",
  judicial: "Judicial",
};

// ─── Entidade Principal ───────────────────────────────────────────────────────

export interface TrafficFine {
  id: string;

  // Auto de Infração
  noticeNumber: string;           // AIT: "5A1234567"
  issuingAgency: string;          // "DER-SP" | "DETRAN" | "SMT" etc.
  noticePdf?: string;             // URL do PDF do auto

  // Infração
  vehicleId: string;
  plate: string;
  infractionCode: string;         // ex: "7455-3"
  description: string;
  fineCategory: FineCategory;
  occurrenceDate: string;         // ISO — data/hora do flagrante
  receivedDate: string;           // quando chegou na frota

  // Valores com desconto
  originalAmount: number;         // valor cheio
  discountAmount: number;         // desconto disponível (20-40%)
  discountDeadline: string;       // prazo para usar desconto
  currentAmount: number;          // valor a pagar hoje

  // Prazo final sem desconto
  dueDate: string;

  // Pontuação CNH
  points: number;

  // Responsabilidade
  responsibleParty: ResponsibleParty;

  // Status e identificação
  status: TrafficFineStatus;
  driverId?: string;
  driverName?: string;
  identificationMethod: "auto" | "manual" | "pending";

  // Integrações
  arId?: string;                  // → accounts_receivable
  appealId?: string;              // → fine_appeals
  dispatcherTaskId?: string;      // → dispatcher_tasks (multas DTP)

  // Timeline jurídica
  timeline: FineTimelineEvent[];

  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
