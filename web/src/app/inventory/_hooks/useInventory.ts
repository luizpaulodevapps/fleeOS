"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { InventoryItem, InventoryFormData, InventoryMovement } from "../_lib/types";
import { DEFAULT_STOCK_MIN, DEFAULT_PART_CODE_PREFIX } from "../_lib/constants";

export function useInventory() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("inventory_items");
      setInventoryItems(data || []);
    } catch (e) {
      console.error("Erro ao carregar estoque", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const saveInventoryItem = useCallback(
    async (invFormData: InventoryFormData, selectedInv: InventoryItem | null) => {
      try {
        const payload = {
          code: invFormData.code,
          name: invFormData.name,
          minQty: Number(invFormData.minQty),
          currentQty: Number(invFormData.currentQty),
          avgCost: Number(invFormData.avgCost),
          unit: invFormData.unit,
          active: invFormData.active
        };

        if (selectedInv) {
          await updateDocument("inventory_items", selectedInv.id, payload);
        } else {
          const newItem = await addDocument("inventory_items", payload);
          if (payload.currentQty > 0) {
            await addDocument("inventory_movements", {
              itemId: newItem.id,
              type: "IN",
              qty: payload.currentQty,
              unitCost: payload.avgCost,
              totalCost: payload.currentQty * payload.avgCost,
              referenceId: "manual",
              referenceType: "adjustment",
              notes: "Carga de estoque inicial",
              createdAt: new Date().toISOString()
            });
          }
        }

        await loadInventory();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [addDocument, updateDocument, loadInventory]
  );

  const deleteInventoryItem = useCallback(
    async (id: string) => {
      try {
        await updateDocument("inventory_items", id, { active: false });
        await loadInventory();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [updateDocument, loadInventory]
  );

  const generatePartCode = () => {
    return `${DEFAULT_PART_CODE_PREFIX}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const getLowStockItems = () => {
    return inventoryItems.filter(i => i.currentQty <= i.minQty);
  };

  return {
    inventoryItems,
    loading,
    loadInventory,
    saveInventoryItem,
    deleteInventoryItem,
    generatePartCode,
    getLowStockItems
  };
}

export function useInventoryMovements() {
  const { getCollection } = useAuth();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("inventory_movements");
      setMovements(data || []);
    } catch (e) {
      console.error("Erro ao carregar movimentações", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  return {
    movements,
    loading,
    loadMovements
  };
}
