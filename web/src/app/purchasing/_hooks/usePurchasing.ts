"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Supplier, SupplierFormData, PurchaseOrder, PurchaseOrderFormData } from "../_lib/types";
import { DEFAULT_PAYMENT_METHOD } from "../_lib/constants";

export function useSuppliers() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("suppliers");
      setSuppliers(data || []);
    } catch (e) {
      console.error("Erro ao carregar fornecedores", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const saveSupplier = useCallback(
    async (supFormData: SupplierFormData, selectedSup: Supplier | null) => {
      try {
        const payload = {
          name: supFormData.name,
          cnpj: supFormData.cnpj,
          phone: supFormData.phone,
          email: supFormData.email,
          address: supFormData.address,
          active: supFormData.active
        };

        if (selectedSup) {
          await updateDocument("suppliers", selectedSup.id, payload);
        } else {
          await addDocument("suppliers", payload);
        }

        await loadSuppliers();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [addDocument, updateDocument, loadSuppliers]
  );

  return {
    suppliers,
    loading,
    loadSuppliers,
    saveSupplier
  };
}

export function usePurchaseOrders() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [poList, poiList] = await Promise.all([
        getCollection("purchase_orders"),
        getCollection("purchase_order_items")
      ]);
      setPurchaseOrders(poList || []);
      setPurchaseOrderItems(poiList || []);
    } catch (e) {
      console.error("Erro ao carregar ordens de compra", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const savePurchaseOrder = useCallback(
    async (poFormData: PurchaseOrderFormData) => {
      try {
        if (poFormData.items.length === 0) {
          throw new Error("Adicione itens à sua ordem de compra!");
        }

        const generatedPoId = `po-${Math.random().toString(36).substr(2, 9)}`;
        const totalCost = poFormData.items.reduce((sum, item) => sum + item.qty * item.unitCost, 0);

        await addDocument("purchase_orders", {
          id: generatedPoId,
          supplierId: poFormData.supplierId,
          status: "ordered",
          totalCost,
          paymentMethod: poFormData.paymentMethod,
          createdAt: new Date().toISOString(),
          deliveredAt: ""
        });

        for (const item of poFormData.items) {
          await addDocument("purchase_order_items", {
            purchaseOrderId: generatedPoId,
            itemId: item.itemId,
            qty: item.qty,
            unitCost: item.unitCost,
            totalCost: item.qty * item.unitCost
          });
        }

        await loadPurchaseOrders();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [addDocument, loadPurchaseOrders]
  );

  const deliverPurchaseOrder = useCallback(
    async (po: PurchaseOrder, inventoryItems: any[]) => {
      try {
        await updateDocument("purchase_orders", po.id, {
          status: "delivered",
          deliveredAt: new Date().toISOString()
        });

        const matchedPoi = purchaseOrderItems.filter(item => item.purchaseOrderId === po.id);
        for (const poi of matchedPoi) {
          const item = inventoryItems.find(i => i.id === poi.itemId);
          if (item) {
            const currentQty = item.currentQty || 0;
            const currentAvgCost = item.avgCost || 0;
            const totalQty = currentQty + poi.qty;
            const newAvgCost = totalQty > 0
              ? ((currentQty * currentAvgCost) + (poi.qty * poi.unitCost)) / totalQty
              : currentAvgCost;

            await updateDocument("inventory_items", item.id, {
              currentQty: totalQty,
              avgCost: Math.round(newAvgCost * 100) / 100
            });

            await addDocument("inventory_movements", {
              itemId: item.id,
              type: "IN",
              qty: poi.qty,
              unitCost: poi.unitCost,
              totalCost: poi.qty * poi.unitCost,
              referenceId: po.id,
              referenceType: "purchase_order",
              notes: `Entrada da Compra PO-${po.id.substring(0, 5).toUpperCase()}`,
              createdAt: new Date().toISOString()
            });
          }
        }

        await loadPurchaseOrders();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [updateDocument, addDocument, purchaseOrderItems, loadPurchaseOrders]
  );

  return {
    purchaseOrders,
    purchaseOrderItems,
    loading,
    loadPurchaseOrders,
    savePurchaseOrder,
    deliverPurchaseOrder
  };
}
