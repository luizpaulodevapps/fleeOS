"use client";

import { useMemo, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { VehicleExpense, CostAnalysis } from "../_lib/types";

export function useCostAnalysis() {
  const { getCollection } = useAuth();
  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const [expList, movList] = await Promise.all([
        getCollection("vehicle_expenses"),
        getCollection("inventory_movements")
      ]);
      setVehicleExpenses(expList || []);
      setInventoryMovements(movList || []);
    } catch (e) {
      console.error("Erro ao carregar despesas", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const analyzeCosts = useCallback(
    (vehicles: any[], inventoryItems: any[], pricingCategories: any[]): CostAnalysis => {
      // Total expenses sum
      const totalExpensesSum = vehicleExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

      // Total KM rodado in the fleet
      const totalKmRodado = vehicles.reduce((s, v) => {
        const acq = vehicleExpenses.find(e => e.vehicleId === v.id && e.referenceType === "vehicle_acquisition");
        const admissionMileage = acq ? Number(acq.metadata?.admissionMileage || 0) : 0;
        return s + Math.max(0, (v.mileage || 0) - admissionMileage);
      }, 0);

      const costPerKm = totalKmRodado > 0 ? totalExpensesSum / totalKmRodado : 0;

      // Costs by Vehicle
      const costsByVehicleObj: Record<string, number> = {};
      vehicleExpenses.forEach(e => {
        if (e.vehicleId) {
          costsByVehicleObj[e.vehicleId] = (costsByVehicleObj[e.vehicleId] || 0) + (Number(e.amount) || 0);
        }
      });

      const getVehicleInfo = (vehicleId: string) => {
        const veh = vehicles.find(v => v.id === vehicleId);
        return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo Não Encontrado";
      };

      const costsByVehicle = Object.entries(costsByVehicleObj)
        .map(([vehicleId, amount]) => ({
          vehicleId,
          info: getVehicleInfo(vehicleId),
          amount
        }))
        .sort((a, b) => b.amount - a.amount);

      // Costs by Category
      const getVehicleCategoryName = (vehicleId: string) => {
        const veh = vehicles.find(v => v.id === vehicleId);
        if (!veh) return "Sem Categoria";
        const cat = pricingCategories.find(c => c.id === veh.pricingCategoryId);
        return cat ? cat.name : "Econômicos";
      };

      const costsByCategoryObj: Record<string, number> = {};
      vehicleExpenses.forEach(e => {
        if (e.vehicleId) {
          const catName = getVehicleCategoryName(e.vehicleId);
          costsByCategoryObj[catName] = (costsByCategoryObj[catName] || 0) + (Number(e.amount) || 0);
        }
      });

      const costsByCategory = Object.entries(costsByCategoryObj).map(([category, amount]) => ({
        category,
        amount
      }));

      // Parts consumption
      const getInventoryItemName = (itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId);
        return item ? item.name : "Peça desconhecida";
      };

      const getInventoryItemCode = (itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId);
        return item ? item.code : "-";
      };

      const partsConsumptionObj: Record<string, { qty: number; cost: number }> = {};
      inventoryMovements
        .filter(m => m.type === "OUT")
        .forEach(m => {
          if (m.itemId) {
            const prev = partsConsumptionObj[m.itemId] || { qty: 0, cost: 0 };
            partsConsumptionObj[m.itemId] = {
              qty: prev.qty + (m.qty || 0),
              cost: prev.cost + (m.totalCost || 0)
            };
          }
        });

      const partsConsumption = Object.entries(partsConsumptionObj)
        .map(([itemId, stats]) => ({
          itemId,
          name: getInventoryItemName(itemId),
          code: getInventoryItemCode(itemId),
          qty: stats.qty,
          cost: stats.cost
        }))
        .sort((a, b) => b.cost - a.cost);

      return {
        totalExpensesSum,
        totalKmRodado,
        costPerKm,
        costsByVehicle,
        costsByCategory,
        partsConsumption
      };
    },
    [vehicleExpenses, inventoryMovements]
  );

  return {
    vehicleExpenses,
    inventoryMovements,
    loading,
    loadExpenses,
    analyzeCosts
  };
}
