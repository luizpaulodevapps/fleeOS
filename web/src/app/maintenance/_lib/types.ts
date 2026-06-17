// Maintenance Types

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: "Preventiva" | "Corretiva" | "Sinistro";
  description: string;
  cost: number;
  date: string;
  mileage: number;
  nextMaintenanceMileage: number;
  crashSeverity?: "Leve" | "Média" | "Grave" | null;
}

export interface MaintenancePlanItem {
  id: string;
  vehicleId: string;
  itemName: string;
  intervalKm: number;
  lastServiceKm: number;
  nextServiceKm: number;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  description: string;
  status: "in_progress" | "completed" | "cancelled";
  mileage: number;
  totalPartsCost: number;
  totalLaborCost: number;
  totalCost: number;
  operatorId: string;
  createdAt: string;
  completedAt?: string;
  originProcedureId?: string | null;
  plannedCost?: number;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  type: "PART" | "LABOR";
  itemId: string | null;
  description: string;
  qty: number;
  unitCost: number;
  totalCost: number;
}

export interface MaintenanceFormData {
  vehicleId: string;
  type: "Preventiva" | "Corretiva" | "Sinistro";
  description: string;
  cost: string;
  date: string;
  mileage: string;
  nextMaintenanceMileage: string;
  putInMaintenanceStatus: boolean;
  crashSeverity: "Leve" | "Média" | "Grave";
}

export interface PlanFormData {
  vehicleId: string;
  itemName: string;
  intervalKm: string;
  lastServiceKm: string;
}

export interface WorkOrderFormData {
  vehicleId: string;
  description: string;
  mileage: string;
  status: "in_progress" | "completed" | "cancelled";
  items: Array<{
    type: "PART" | "LABOR";
    itemId: string | null;
    description: string;
    qty: number;
    unitCost: number;
  }>;
  originProcedureId?: string | null;
  plannedCost?: number;
}

export interface WorkOrderItemInput {
  type: "PART" | "LABOR";
  itemId: string;
  description: string;
  qty: number;
  unitCost: number;
}

// ─── Engenharia de Manutenção ──────────────────────────────────────────────

export type ProcedureCategory =
  | "oil"
  | "filter"
  | "brake"
  | "tire"
  | "belt"
  | "electrical"
  | "gnv"
  | "hybrid"
  | "ev"
  | "other";

export type VehicleCategory = "flex" | "gnv" | "hybrid" | "ev" | "diesel" | "other";

/** Catálogo reutilizável de procedimentos de manutenção */
export interface MaintenanceProcedure {
  id: string;
  name: string;
  category: ProcedureCategory;
  intervalKm: number | null;
  intervalDays: number | null;
  estimatedDurationMinutes: number;
  mandatory: boolean;
  notes: string;
}

/** Item de kit de peças de um procedimento */
export interface ProcedurePartKitItem {
  inventoryItemId: string | null;
  description: string;
  qty: number;
  unit: string;
}

/** Kit de peças vinculado a um procedimento */
export interface ProcedurePartKit {
  id: string;
  procedureId: string;
  items: ProcedurePartKitItem[];
}

/** Plano de manutenção por modelo / categoria de veículo */
export interface MaintenancePlan {
  id: string;
  name: string;
  manufacturer: string;
  category: VehicleCategory;
  applicableModels: string[];
  procedures: string[];
  isDefault: boolean;
  notes: string;
}

/** Vínculo entre um veículo e um Plano de Manutenção */
export interface VehicleMaintenancePlan {
  id: string;
  vehicleId: string;
  planId: string;
  assignedAt: string;
  notes: string;
}

/** Registro histórico de execução de um procedimento em um veículo */
export interface ProcedureHistory {
  id: string;
  vehicleId: string;
  procedureId: string;
  executedKm: number;
  executedAt: string;
  nextDueKm: number | null;
  nextDueDate: string | null;
  workOrderId: string | null;
  notes: string;
}

/** Alerta calculado pelo engine de manutenção */
export type AlertStatus = "overdue" | "due_soon" | "ok";

export interface ProcedureAlert {
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleBrand: string;
  vehicleMileage: number;
  procedureId: string;
  procedureName: string;
  procedureCategory: ProcedureCategory;
  lastExecutedKm: number | null;
  nextDueKm: number | null;
  intervalKm: number | null;
  intervalDays: number | null;
  nextDueDate: string | null;
  lastExecutedDate: string | null;
  status: AlertStatus;
  kmOverdue: number;
  estimatedDurationMinutes: number;
  hasPartsInStock: boolean;
  estimatedCost: number;
  partKit: ProcedurePartKitItem[];
}

// Form data para modais de engenharia
export interface MaintenancePlanFormData {
  name: string;
  manufacturer: string;
  category: VehicleCategory;
  applicableModels: string;
  procedures: string[];
  isDefault: boolean;
  notes: string;
}

export interface MaintenanceProcedureFormData {
  name: string;
  category: ProcedureCategory;
  intervalKm: string;
  intervalDays: string;
  estimatedDurationMinutes: string;
  mandatory: boolean;
  notes: string;
}

// ─── Catálogo Técnico de Veículos ──────────────────────────────────────────

export type CatalogSpecType =
  | "oil"
  | "filter_oil"
  | "filter_air"
  | "filter_cabin"
  | "brake_fluid"
  | "coolant"
  | "spark_plug"
  | "belt"
  | "transmission_fluid"
  | "tire_spec"
  | "hybrid_fluid"
  | "other";

export const CATALOG_SPEC_LABELS: Record<CatalogSpecType, string> = {
  oil: "Óleo Motor",
  filter_oil: "Filtro de Óleo",
  filter_air: "Filtro de Ar",
  filter_cabin: "Filtro de Cabine",
  brake_fluid: "Fluido de Freio",
  coolant: "Arrefecimento",
  spark_plug: "Velas",
  belt: "Correia",
  transmission_fluid: "Fluido Câmbio",
  tire_spec: "Pneu (Especificação)",
  hybrid_fluid: "Fluido Híbrido",
  other: "Outros",
};

export const CATALOG_SPEC_ICONS: Record<CatalogSpecType, string> = {
  oil: "🛢️",
  filter_oil: "🔵",
  filter_air: "💨",
  filter_cabin: "🌬️",
  brake_fluid: "🔴",
  coolant: "💧",
  spark_plug: "⚡",
  belt: "⚙️",
  transmission_fluid: "🟡",
  tire_spec: "🔘",
  hybrid_fluid: "🔋",
  other: "🔧",
};

/** Uma especificação técnica dentro do catálogo do veículo */
export interface VehicleCatalogSpec {
  type: CatalogSpecType;
  description: string;
  partNumber: string;
  quantity: number;
  unit: string;
  inventoryItemId: string | null;
  notes: string;
}

/** Catálogo técnico de um modelo/versão de veículo */
export interface VehicleCatalog {
  id: string;
  make: string;
  model: string;
  engine: string;
  yearFrom: number;
  yearTo: number | null;
  category: VehicleCategory;
  defaultPlanId: string | null;
  specs: VehicleCatalogSpec[];
  notes: string;
}

export interface VehicleCatalogFormData {
  make: string;
  model: string;
  engine: string;
  yearFrom: string;
  yearTo: string;
  category: VehicleCategory;
  defaultPlanId: string;
  notes: string;
}
