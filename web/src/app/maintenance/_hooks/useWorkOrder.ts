"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { WorkOrder, WorkOrderFormData } from "../_lib/types";

export function useWorkOrder() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrderItems, setWorkOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [woList, woiList] = await Promise.all([
        getCollection("work_orders"),
        getCollection("work_order_items")
      ]);
      setWorkOrders(woList || []);
      setWorkOrderItems(woiList || []);
    } catch (e) {
      console.error("Erro ao carregar ordens de serviço", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const saveWorkOrder = useCallback(
    async (
      woFormData: WorkOrderFormData,
      selectedWo: WorkOrder | null,
      vehicles: any[],
      inventoryItems: any[],
      vehicleExpenses: any[],
      currentUserId: string
    ) => {
      try {
        const selectedVeh = vehicles.find(v => v.id === woFormData.vehicleId);
        const totalPartsCost = woFormData.items
          .filter(item => item.type === "PART")
          .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
        const totalLaborCost = woFormData.items
          .filter(item => item.type === "LABOR")
          .reduce((sum, item) => sum + item.qty * item.unitCost, 0);
        const totalCost = totalPartsCost + totalLaborCost;

        const woId = selectedWo ? selectedWo.id : `wo-${Math.random().toString(36).substr(2, 9)}`;

        const woPayload = {
          id: woId,
          vehicleId: woFormData.vehicleId,
          description: woFormData.description,
          status: woFormData.status,
          mileage: Number(woFormData.mileage),
          totalPartsCost,
          totalLaborCost,
          totalCost,
          operatorId: currentUserId || "uid-super",
          createdAt: selectedWo ? selectedWo.createdAt : new Date().toISOString(),
          completedAt: woFormData.status === "completed" ? new Date().toISOString() : (selectedWo?.completedAt || "")
        };

        // 1. Create/Update OS
        if (selectedWo) {
          await updateDocument("work_orders", selectedWo.id, woPayload);
        } else {
          await addDocument("work_orders", woPayload);
        }

        // 2. Delete and recreate items
        const allWoi = await getCollection("work_order_items");
        const matchedWoi = allWoi.filter(item => item.workOrderId === woId);
        for (const item of matchedWoi) {
          await deleteDocument("work_order_items", item.id);
        }

        for (const item of woFormData.items) {
          await addDocument("work_order_items", {
            workOrderId: woId,
            type: item.type,
            itemId: item.itemId,
            description: item.description,
            qty: item.qty,
            unitCost: item.unitCost,
            totalCost: item.qty * item.unitCost
          });
        }

        // 3. Side effects on transition to completed
        const isNewlyCompleted = woFormData.status === "completed" && (!selectedWo || selectedWo.status !== "completed");
        if (isNewlyCompleted) {
          // Decrement stock & log movements
          for (const item of woFormData.items) {
            if (item.type === "PART" && item.itemId) {
              const invItem = inventoryItems.find(i => i.id === item.itemId);
              if (invItem) {
                const newQty = Math.max(0, invItem.currentQty - item.qty);
                await updateDocument("inventory_items", invItem.id, {
                  currentQty: newQty
                });

                await addDocument("inventory_movements", {
                  itemId: invItem.id,
                  type: "OUT",
                  qty: item.qty,
                  unitCost: item.unitCost,
                  totalCost: item.qty * item.unitCost,
                  referenceId: woId,
                  referenceType: "work_order",
                  notes: `Consumo na OS OS-${woId.substring(0, 5).toUpperCase()}: ${woFormData.description}`,
                  createdAt: new Date().toISOString()
                });
              }
            }
          }

          // Add legacy log
          await addDocument("maintenance", {
            vehicleId: woFormData.vehicleId,
            type: "Corretiva",
            description: `OS-${woId.substring(0, 5).toUpperCase()}: ${woFormData.description}`,
            cost: totalCost,
            date: new Date().toISOString().split("T")[0],
            mileage: Number(woFormData.mileage),
            nextMaintenanceMileage: Number(woFormData.mileage) + 10000
          });

          // Add vehicle expense
          await addDocument("vehicle_expenses", {
            vehicleId: woFormData.vehicleId,
            expenseType: "maintenance",
            amount: totalCost,
            date: new Date().toISOString().split("T")[0],
            referenceId: woId,
            referenceType: "work_order",
            description: `OS-${woId.substring(0, 5).toUpperCase()}: ${woFormData.description}`,
            createdAt: new Date().toISOString()
          });

          // Update vehicle odometer and status
          if (selectedVeh) {
            await updateDocument("vehicles", selectedVeh.id, {
              mileage: Math.max(selectedVeh.mileage || 0, Number(woFormData.mileage)),
              status: "active"
            });
          }
        }

        await loadWorkOrders();
      } catch (e) {
        console.error(e);
        throw new Error("Erro ao salvar OS.");
      }
    },
    [addDocument, updateDocument, deleteDocument, getCollection, loadWorkOrders]
  );

  const deleteWorkOrder = useCallback(
    async (id: string, vehicleExpenses: any[]) => {
      try {
        // Delete items
        const allWoi = await getCollection("work_order_items");
        const matchedWoi = allWoi.filter(item => item.workOrderId === id);
        for (const item of matchedWoi) {
          await deleteDocument("work_order_items", item.id);
        }

        // Delete corresponding expenses if completed
        const matchedExp = vehicleExpenses.find(e => e.referenceId === id && e.referenceType === "work_order");
        if (matchedExp) {
          await deleteDocument("vehicle_expenses", matchedExp.id);
        }

        await deleteDocument("work_orders", id);
        await loadWorkOrders();
      } catch (e) {
        console.error(e);
        throw new Error("Erro ao deletar OS.");
      }
    },
    [deleteDocument, getCollection, loadWorkOrders]
  );

  return {
    workOrders,
    workOrderItems,
    loading,
    loadWorkOrders,
    saveWorkOrder,
    deleteWorkOrder
  };
}
