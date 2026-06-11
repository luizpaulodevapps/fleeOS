"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { MaintenanceLog, MaintenanceFormData, MaintenancePlanItem, PlanFormData } from "../_lib/types";

export function useMaintenance() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("maintenance");
      setMaintenance(data || []);
    } catch (e) {
      console.error("Erro ao carregar manutenções", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const createMaintenance = useCallback(
    async (formData: MaintenanceFormData, vehicles: any[]) => {
      try {
        const selectedVeh = vehicles.find(v => v.id === formData.vehicleId);
        const costAmount = Number(formData.cost);

        const dataToSave = {
          vehicleId: formData.vehicleId,
          type: formData.type,
          description: formData.description + (formData.type === "Sinistro" ? ` [Gravidade: ${formData.crashSeverity}]` : ""),
          cost: costAmount,
          date: formData.date,
          mileage: Number(formData.mileage),
          nextMaintenanceMileage: Number(formData.nextMaintenanceMileage),
          crashSeverity: formData.type === "Sinistro" ? formData.crashSeverity : null
        };

        // 1. Add maintenance record
        const newMaint = await addDocument("maintenance", dataToSave);

        // 2. Add vehicle expense record
        await addDocument("vehicle_expenses", {
          vehicleId: formData.vehicleId,
          expenseType: formData.type === "Sinistro" ? "incident" : "maintenance",
          amount: costAmount,
          date: formData.date,
          referenceId: newMaint.id,
          referenceType: "maintenance_log",
          description: formData.description,
          createdAt: new Date().toISOString()
        });

        // 3. Automatically update vehicle status and mileage if checked
        if (selectedVeh) {
          const updatedFields: any = {
            mileage: Math.max(selectedVeh.mileage || 0, Number(formData.mileage))
          };
          if (formData.putInMaintenanceStatus) {
            updatedFields.status = "maintenance";
          }
          await updateDocument("vehicles", selectedVeh.id, updatedFields);
        }

        await loadMaintenance();
        return newMaint;
      } catch (err) {
        console.error("Erro ao registrar manutenção", err);
        throw err;
      }
    },
    [addDocument, updateDocument, loadMaintenance]
  );

  const deleteMaintenance = useCallback(
    async (id: string, vehicleExpenses: any[]) => {
      try {
        // Find corresponding vehicle expense and delete it too
        const exp = vehicleExpenses.find(e => e.referenceId === id && e.referenceType === "maintenance_log");
        if (exp) {
          await deleteDocument("vehicle_expenses", exp.id);
        }
        await deleteDocument("maintenance", id);
        await loadMaintenance();
      } catch (err) {
        console.error("Erro ao excluir", err);
        throw err;
      }
    },
    [deleteDocument, loadMaintenance]
  );

  const finishMaintenance = useCallback(
    async (maint: MaintenanceLog, vehicles: any[]) => {
      try {
        const selectedVeh = vehicles.find(v => v.id === maint.vehicleId);
        if (!selectedVeh) throw new Error("Veículo não encontrado");

        await updateDocument("vehicles", selectedVeh.id, {
          status: "active"
        });
        await loadMaintenance();
      } catch (err) {
        console.error("Erro ao reativar veículo", err);
        throw err;
      }
    },
    [updateDocument, loadMaintenance]
  );

  return {
    maintenance,
    loading,
    loadMaintenance,
    createMaintenance,
    deleteMaintenance,
    finishMaintenance
  };
}

export function useMaintenancePlan() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [planItems, setPlanItems] = useState<MaintenancePlanItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlanItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("maintenance_plan_items");
      setPlanItems(data || []);
    } catch (e) {
      console.error("Erro ao carregar planos", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const createPlanItem = useCallback(
    async (formData: PlanFormData) => {
      try {
        const lastKm = Number(formData.lastServiceKm);
        const interval = Number(formData.intervalKm);

        await addDocument("maintenance_plan_items", {
          vehicleId: formData.vehicleId,
          itemName: formData.itemName,
          intervalKm: interval,
          lastServiceKm: lastKm,
          nextServiceKm: lastKm + interval
        });

        await loadPlanItems();
      } catch (e) {
        console.error("Erro ao cadastrar plano", e);
        throw e;
      }
    },
    [addDocument, loadPlanItems]
  );

  const performService = useCallback(
    async (item: MaintenancePlanItem, vehicles: any[]) => {
      try {
        const veh = vehicles.find(v => v.id === item.vehicleId);
        if (!veh) throw new Error("Veículo não encontrado");

        const currentKm = Number(veh.mileage || 0);

        await updateDocument("maintenance_plan_items", item.id, {
          lastServiceKm: currentKm,
          nextServiceKm: currentKm + Number(item.intervalKm)
        });

        // Add history log
        const log = await addDocument("maintenance", {
          vehicleId: item.vehicleId,
          type: "Preventiva",
          description: `Serviço realizado do plano preventivo: ${item.itemName}`,
          cost: 0,
          date: new Date().toISOString().split("T")[0],
          mileage: currentKm,
          nextMaintenanceMileage: currentKm + Number(item.intervalKm)
        });

        // Add expense log (zero cost for record keeping)
        await addDocument("vehicle_expenses", {
          vehicleId: item.vehicleId,
          expenseType: "maintenance",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          referenceId: log.id,
          referenceType: "maintenance_log",
          description: `Plano Preventivo: ${item.itemName}`,
          createdAt: new Date().toISOString()
        });

        await loadPlanItems();
      } catch (e) {
        console.error("Erro ao realizar serviço", e);
        throw e;
      }
    },
    [addDocument, updateDocument, loadPlanItems]
  );

  const deletePlanItem = useCallback(
    async (id: string) => {
      try {
        await deleteDocument("maintenance_plan_items", id);
        await loadPlanItems();
      } catch (err) {
        console.error("Erro ao excluir item do plano", err);
        throw err;
      }
    },
    [deleteDocument, loadPlanItems]
  );

  return {
    planItems,
    loading,
    loadPlanItems,
    createPlanItem,
    performService,
    deletePlanItem
  };
}
