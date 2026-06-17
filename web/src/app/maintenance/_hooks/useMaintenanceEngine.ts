"use client";

import { useMemo } from "react";
import {
  calculateFleetAlerts,
  summarizeByVehicle,
  getUrgentAlerts,
  VehicleAlertSummary,
} from "../_lib/maintenanceEngine";
import {
  MaintenancePlan,
  MaintenanceProcedure,
  VehicleMaintenancePlan,
  ProcedurePartKit,
  ProcedureHistory,
  ProcedureAlert,
} from "../_lib/types";

interface UseMaintenanceEngineInput {
  vehicles: any[];
  vehiclePlans: VehicleMaintenancePlan[];
  plans: MaintenancePlan[];
  procedures: MaintenanceProcedure[];
  partKits: ProcedurePartKit[];
  procedureHistory: ProcedureHistory[];
  inventoryItems: any[];
}

export function useMaintenanceEngine({
  vehicles,
  vehiclePlans,
  plans,
  procedures,
  partKits,
  procedureHistory,
  inventoryItems,
}: UseMaintenanceEngineInput) {
  const allAlerts = useMemo<ProcedureAlert[]>(() => {
    if (!vehicles.length || !plans.length || !procedures.length) return [];
    return calculateFleetAlerts(
      vehicles,
      vehiclePlans,
      plans,
      procedures,
      partKits,
      procedureHistory,
      inventoryItems
    );
  }, [vehicles, vehiclePlans, plans, procedures, partKits, procedureHistory, inventoryItems]);

  const urgentAlerts = useMemo(
    () => getUrgentAlerts(allAlerts),
    [allAlerts]
  );

  const vehicleSummaries = useMemo<VehicleAlertSummary[]>(
    () => summarizeByVehicle(allAlerts),
    [allAlerts]
  );

  const overdueCount = useMemo(
    () => allAlerts.filter((a) => a.status === "overdue").length,
    [allAlerts]
  );

  const dueSoonCount = useMemo(
    () => allAlerts.filter((a) => a.status === "due_soon").length,
    [allAlerts]
  );

  return {
    allAlerts,
    urgentAlerts,
    vehicleSummaries,
    overdueCount,
    dueSoonCount,
    totalAlerts: allAlerts.length,
  };
}
