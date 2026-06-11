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
}

export interface WorkOrderItemInput {
  type: "PART" | "LABOR";
  itemId: string;
  description: string;
  qty: number;
  unitCost: number;
}
