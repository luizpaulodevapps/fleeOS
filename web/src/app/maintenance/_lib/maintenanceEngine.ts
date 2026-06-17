/**
 * maintenanceEngine.ts
 * 
 * Motor puro de alertas de manutenção da frota.
 * Recebe dados, devolve alertas calculados. Sem side effects.
 */

import {
  MaintenanceProcedure,
  MaintenancePlan,
  VehicleMaintenancePlan,
  ProcedurePartKit,
  ProcedureHistory,
  ProcedureAlert,
  AlertStatus,
  ProcedurePartKitItem,
} from "./types";

const DUE_SOON_THRESHOLD_KM = 1000; // 1.000 km de margem de antecedência

/** Determina o status do alerta com base em KM e/ou dias */
function calculateStatus(
  vehicleMileage: number,
  nextDueKm: number | null,
  nextDueDate: string | null
): { status: AlertStatus; kmOverdue: number } {
  let status: AlertStatus = "ok";
  let kmOverdue = 0;

  // Verificação por KM
  if (nextDueKm !== null) {
    const diff = vehicleMileage - nextDueKm;
    kmOverdue = diff; // positivo = vencido, negativo = faltam X km
    if (diff >= 0) {
      status = "overdue";
    } else if (diff >= -DUE_SOON_THRESHOLD_KM) {
      status = "due_soon";
    }
  }

  // Verificação por data (só piora o status, nunca melhora)
  if (nextDueDate && status !== "overdue") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate + "T00:00:00");
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      status = "overdue";
      if (kmOverdue === 0) kmOverdue = diffDays; // usa dias como proxy
    } else if (diffDays <= 15 && status === "ok") {
      status = "due_soon";
    }
  }

  return { status, kmOverdue };
}

/** Calcula a próxima data de vencimento baseada em dias */
function calculateNextDueDate(
  lastExecutedDate: string | null,
  intervalDays: number | null
): string | null {
  if (!lastExecutedDate || !intervalDays) return null;
  const last = new Date(lastExecutedDate + "T00:00:00");
  last.setDate(last.getDate() + intervalDays);
  return last.toISOString().split("T")[0];
}

/** Estima o custo do kit de peças com base no inventário */
function estimateKitCost(
  kit: ProcedurePartKit | undefined,
  inventoryItems: any[]
): { estimatedCost: number; hasPartsInStock: boolean } {
  if (!kit || !kit.items || kit.items.length === 0) {
    return { estimatedCost: 0, hasPartsInStock: true };
  }

  let estimatedCost = 0;
  let hasPartsInStock = true;

  for (const kitItem of kit.items) {
    if (kitItem.inventoryItemId) {
      const invItem = inventoryItems.find((i) => i.id === kitItem.inventoryItemId);
      if (invItem) {
        estimatedCost += (invItem.avgCost || 0) * kitItem.qty;
        if (invItem.currentQty < kitItem.qty) {
          hasPartsInStock = false;
        }
      }
    }
    // Se não tem inventoryItemId, não impacta estoque nem custo calculado
  }

  return { estimatedCost, hasPartsInStock };
}

/**
 * Função principal do engine.
 * Retorna todos os alertas de manutenção da frota, ordenados por urgência.
 */
export function calculateFleetAlerts(
  vehicles: any[],
  vehiclePlans: VehicleMaintenancePlan[],
  plans: MaintenancePlan[],
  procedures: MaintenanceProcedure[],
  partKits: ProcedurePartKit[],
  procedureHistory: ProcedureHistory[],
  inventoryItems: any[]
): ProcedureAlert[] {
  const alerts: ProcedureAlert[] = [];

  for (const vehicle of vehicles) {
    // 1. Encontrar o plano vinculado ao veículo
    const vehiclePlan = vehiclePlans.find((vp) => vp.vehicleId === vehicle.id);
    if (!vehiclePlan) continue;

    const plan = plans.find((p) => p.id === vehiclePlan.planId);
    if (!plan) continue;

    const vehicleMileage = Number(vehicle.mileage || 0);

    // 2. Para cada procedimento do plano, calcular alerta
    for (const procedureId of plan.procedures) {
      const procedure = procedures.find((p) => p.id === procedureId);
      if (!procedure) continue;

      // Histórico mais recente deste procedimento neste veículo
      const history = procedureHistory
        .filter((h) => h.vehicleId === vehicle.id && h.procedureId === procedureId)
        .sort((a, b) => b.executedKm - a.executedKm);

      const lastHistory = history[0] || null;

      // Calcular next due KM
      let nextDueKm: number | null = null;
      let lastExecutedKm: number | null = null;
      let lastExecutedDate: string | null = null;

      if (lastHistory) {
        lastExecutedKm = lastHistory.executedKm;
        lastExecutedDate = lastHistory.executedAt;
        if (procedure.intervalKm) {
          nextDueKm = lastHistory.executedKm + procedure.intervalKm;
        }
      } else if (procedure.intervalKm) {
        // Nunca foi feito — considera que está "due" desde 0
        nextDueKm = procedure.intervalKm;
      }

      // Calcular next due date
      const nextDueDateFromDays = calculateNextDueDate(
        lastExecutedDate,
        procedure.intervalDays
      );

      // Se nunca foi feito e tem intervalo por dias, marca como overdue
      const nextDueDate = nextDueDateFromDays;

      const { status, kmOverdue } = calculateStatus(
        vehicleMileage,
        nextDueKm,
        // Se nunca executado e tem intervalo por dias, considera vencido
        !lastExecutedDate && procedure.intervalDays ? "2000-01-01" : nextDueDate
      );

      // Kit de peças
      const kit = partKits.find((k) => k.procedureId === procedureId);
      const { estimatedCost, hasPartsInStock } = estimateKitCost(kit, inventoryItems);

      alerts.push({
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate || "",
        vehicleModel: vehicle.model || "",
        vehicleBrand: vehicle.brand || "",
        vehicleMileage,
        procedureId,
        procedureName: procedure.name,
        procedureCategory: procedure.category,
        lastExecutedKm,
        nextDueKm,
        intervalKm: procedure.intervalKm,
        intervalDays: procedure.intervalDays,
        nextDueDate,
        lastExecutedDate,
        status,
        kmOverdue,
        estimatedDurationMinutes: procedure.estimatedDurationMinutes,
        hasPartsInStock,
        estimatedCost,
        partKit: kit?.items || [],
      });
    }
  }

  // Ordenar: overdue primeiro, depois due_soon, depois ok; dentro de cada grupo por kmOverdue desc
  return alerts.sort((a, b) => {
    const order: Record<AlertStatus, number> = { overdue: 0, due_soon: 1, ok: 2 };
    const diff = order[a.status] - order[b.status];
    if (diff !== 0) return diff;
    return b.kmOverdue - a.kmOverdue;
  });
}

/** Retorna apenas os alertas urgentes (overdue + due_soon) */
export function getUrgentAlerts(alerts: ProcedureAlert[]): ProcedureAlert[] {
  return alerts.filter((a) => a.status !== "ok");
}

/** Sumariza alertas por veículo */
export interface VehicleAlertSummary {
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleBrand: string;
  overdueCount: number;
  dueSoonCount: number;
  okCount: number;
  overallStatus: AlertStatus;
}

export function summarizeByVehicle(alerts: ProcedureAlert[]): VehicleAlertSummary[] {
  const map = new Map<string, VehicleAlertSummary>();

  for (const alert of alerts) {
    if (!map.has(alert.vehicleId)) {
      map.set(alert.vehicleId, {
        vehicleId: alert.vehicleId,
        vehiclePlate: alert.vehiclePlate,
        vehicleModel: alert.vehicleModel,
        vehicleBrand: alert.vehicleBrand,
        overdueCount: 0,
        dueSoonCount: 0,
        okCount: 0,
        overallStatus: "ok",
      });
    }

    const summary = map.get(alert.vehicleId)!;
    if (alert.status === "overdue") summary.overdueCount++;
    else if (alert.status === "due_soon") summary.dueSoonCount++;
    else summary.okCount++;
  }

  // Calcular status geral
  for (const summary of map.values()) {
    if (summary.overdueCount > 0) summary.overallStatus = "overdue";
    else if (summary.dueSoonCount > 0) summary.overallStatus = "due_soon";
    else summary.overallStatus = "ok";
  }

  return Array.from(map.values()).sort((a, b) => {
    const order: Record<AlertStatus, number> = { overdue: 0, due_soon: 1, ok: 2 };
    return order[a.overallStatus] - order[b.overallStatus];
  });
}

/** Rótulos e ícones por categoria */
export const PROCEDURE_CATEGORY_LABELS: Record<string, string> = {
  oil: "Óleo",
  filter: "Filtros",
  brake: "Freios",
  tire: "Pneus",
  belt: "Correia",
  electrical: "Elétrico",
  gnv: "GNV",
  hybrid: "Híbrido",
  ev: "Elétrico (EV)",
  other: "Outros",
};

export const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
  flex: "Flex",
  gnv: "GNV",
  hybrid: "Híbrido",
  ev: "Elétrico",
  diesel: "Diesel",
  other: "Outros",
};
