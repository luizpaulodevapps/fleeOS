import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { VehicleCatalog, VehicleCatalogFormData, VehicleCatalogSpec } from "../_lib/types";

// ─── useVehicleCatalog ────────────────────────────────────────────────────────

export function useVehicleCatalog() {
  const { getCollection, addDocument, updateDocument, deleteDocument } = useAuth();
  const [catalog, setCatalog] = useState<VehicleCatalog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection("vehicle_catalog");
      setCatalog((data || []) as VehicleCatalog[]);
    } catch (e) {
      console.error("Erro ao carregar catálogo técnico", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const saveCatalog = useCallback(
    async (
      formData: VehicleCatalogFormData,
      specs: VehicleCatalogSpec[],
      selected: VehicleCatalog | null
    ) => {
      const payload: Omit<VehicleCatalog, "id"> = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        engine: formData.engine.trim(),
        yearFrom: Number(formData.yearFrom) || new Date().getFullYear(),
        yearTo: formData.yearTo ? Number(formData.yearTo) : null,
        category: formData.category,
        defaultPlanId: formData.defaultPlanId || null,
        specs,
        notes: formData.notes.trim(),
      };

      if (selected) {
        await updateDocument("vehicle_catalog", selected.id, payload);
      } else {
        await addDocument("vehicle_catalog", payload);
      }
      await loadCatalog();
    },
    [addDocument, updateDocument, loadCatalog]
  );

  const deleteCatalogEntry = useCallback(
    async (id: string) => {
      await deleteDocument("vehicle_catalog", id);
      await loadCatalog();
    },
    [deleteDocument, loadCatalog]
  );

  /** Finds the best matching catalog entry for a vehicle */
  const findCatalogForVehicle = useCallback(
    (vehicle: { brand?: string; make?: string; model?: string }) => {
      const make = (vehicle.brand || vehicle.make || "").toLowerCase();
      const model = (vehicle.model || "").toLowerCase();
      return catalog.find(
        (c) =>
          c.make.toLowerCase() === make &&
          model.includes(c.model.toLowerCase())
      ) || null;
    },
    [catalog]
  );

  return {
    catalog,
    loading,
    loadCatalog,
    saveCatalog,
    deleteCatalogEntry,
    findCatalogForVehicle,
  };
}
