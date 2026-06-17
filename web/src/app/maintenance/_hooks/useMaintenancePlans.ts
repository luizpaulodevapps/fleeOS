"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MaintenancePlan,
  MaintenanceProcedure,
  VehicleMaintenancePlan,
  ProcedurePartKit,
  ProcedureHistory,
  MaintenancePlanFormData,
  MaintenanceProcedureFormData,
} from "../_lib/types";

// ─── Hook: Planos de Manutenção (Catálogo) ────────────────────────────────

export function useMaintenancePlans() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();

  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("maintenance_plans");
      setPlans(data || []);
    } catch (e) {
      console.error("Erro ao carregar planos de manutenção", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const savePlan = useCallback(
    async (formData: MaintenancePlanFormData, selected: MaintenancePlan | null) => {
      const payload: Omit<MaintenancePlan, "id"> = {
        name: formData.name,
        manufacturer: formData.manufacturer,
        category: formData.category,
        applicableModels: formData.applicableModels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        procedures: formData.procedures,
        isDefault: formData.isDefault,
        notes: formData.notes,
      };

      if (selected) {
        await updateDocument("maintenance_plans", selected.id, payload);
      } else {
        await addDocument("maintenance_plans", payload);
      }
      await loadPlans();
    },
    [addDocument, updateDocument, loadPlans]
  );

  const deletePlan = useCallback(
    async (id: string) => {
      await deleteDocument("maintenance_plans", id);
      await loadPlans();
    },
    [deleteDocument, loadPlans]
  );

  return { plans, loading, loadPlans, savePlan, deletePlan };
}

// ─── Hook: Procedimentos (Catálogo) ───────────────────────────────────────

export function useMaintenanceProcedures() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();

  const [procedures, setProcedures] = useState<MaintenanceProcedure[]>([]);
  const [partKits, setPartKits] = useState<ProcedurePartKit[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProcedures = useCallback(async () => {
    try {
      setLoading(true);
      const [procData, kitData] = await Promise.all([
        getCollection("maintenance_procedures"),
        getCollection("procedure_part_kits"),
      ]);
      setProcedures(procData || []);
      setPartKits(kitData || []);
    } catch (e) {
      console.error("Erro ao carregar procedimentos", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const saveProcedure = useCallback(
    async (
      formData: MaintenanceProcedureFormData,
      kitItems: ProcedurePartKit["items"],
      selected: MaintenanceProcedure | null
    ) => {
      const procedurePayload: Omit<MaintenanceProcedure, "id"> = {
        name: formData.name,
        category: formData.category,
        intervalKm: formData.intervalKm ? Number(formData.intervalKm) : null,
        intervalDays: formData.intervalDays ? Number(formData.intervalDays) : null,
        estimatedDurationMinutes: Number(formData.estimatedDurationMinutes) || 0,
        mandatory: formData.mandatory,
        notes: formData.notes,
      };

      let procedureId: string;

      if (selected) {
        await updateDocument("maintenance_procedures", selected.id, procedurePayload);
        procedureId = selected.id;
      } else {
        const newProc = await addDocument("maintenance_procedures", procedurePayload);
        procedureId = newProc.id;
      }

      // Upsert kit
      const existingKit = partKits.find((k) => k.procedureId === procedureId);
      const kitPayload = {
        procedureId,
        items: kitItems,
      };

      if (existingKit) {
        await updateDocument("procedure_part_kits", existingKit.id, kitPayload);
      } else if (kitItems.length > 0) {
        await addDocument("procedure_part_kits", kitPayload);
      }

      await loadProcedures();
    },
    [addDocument, updateDocument, partKits, loadProcedures]
  );

  const deleteProcedure = useCallback(
    async (id: string) => {
      const kit = partKits.find((k) => k.procedureId === id);
      if (kit) {
        await deleteDocument("procedure_part_kits", kit.id);
      }
      await deleteDocument("maintenance_procedures", id);
      await loadProcedures();
    },
    [deleteDocument, partKits, loadProcedures]
  );

  return { procedures, partKits, loading, loadProcedures, saveProcedure, deleteProcedure };
}

// ─── Hook: Vínculos Veículo → Plano ───────────────────────────────────────

export function useVehiclePlans() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();

  const [vehiclePlans, setVehiclePlans] = useState<VehicleMaintenancePlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVehiclePlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("vehicle_maintenance_plans");
      setVehiclePlans(data || []);
    } catch (e) {
      console.error("Erro ao carregar vínculos veículo-plano", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const assignPlanToVehicle = useCallback(
    async (vehicleId: string, planId: string, notes: string = "") => {
      const existing = vehiclePlans.find((vp) => vp.vehicleId === vehicleId);
      const payload: Omit<VehicleMaintenancePlan, "id"> = {
        vehicleId,
        planId,
        assignedAt: new Date().toISOString(),
        notes,
      };

      if (existing) {
        await updateDocument("vehicle_maintenance_plans", existing.id, payload);
      } else {
        await addDocument("vehicle_maintenance_plans", payload);
      }
      await loadVehiclePlans();
    },
    [addDocument, updateDocument, vehiclePlans, loadVehiclePlans]
  );

  const removePlanFromVehicle = useCallback(
    async (vehiclePlanId: string) => {
      await deleteDocument("vehicle_maintenance_plans", vehiclePlanId);
      await loadVehiclePlans();
    },
    [deleteDocument, loadVehiclePlans]
  );

  return { vehiclePlans, loading, loadVehiclePlans, assignPlanToVehicle, removePlanFromVehicle };
}

// ─── Hook: Histórico de Procedimentos ────────────────────────────────────

export function useProcedureHistory() {
  const { getCollection, addDocument } = useAuth();

  const [procedureHistory, setProcedureHistory] = useState<ProcedureHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProcedureHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("procedure_history");
      setProcedureHistory(data || []);
    } catch (e) {
      console.error("Erro ao carregar histórico de procedimentos", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const recordProcedureExecution = useCallback(
    async (
      vehicleId: string,
      procedureId: string,
      executedKm: number,
      intervalKm: number | null,
      intervalDays: number | null,
      workOrderId: string | null = null,
      notes: string = ""
    ) => {
      const nextDueKm = intervalKm ? executedKm + intervalKm : null;
      const today = new Date().toISOString().split("T")[0];
      const nextDueDate = intervalDays
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + intervalDays);
            return d.toISOString().split("T")[0];
          })()
        : null;

      await addDocument("procedure_history", {
        vehicleId,
        procedureId,
        executedKm,
        executedAt: today,
        nextDueKm,
        nextDueDate,
        workOrderId,
        notes,
      });

      await loadProcedureHistory();
    },
    [addDocument, loadProcedureHistory]
  );

  return { procedureHistory, loading, loadProcedureHistory, recordProcedureExecution };
}
