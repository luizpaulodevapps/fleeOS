"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Assignment, Checklist, AssignmentFormData, ReturnFormData, AuditFormData } from "../_lib/types";

export function useAssignments() {
  const { getCollection, addDocument, updateDocument, currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const [asgList, chkList] = await Promise.all([
        getCollection("vehicle_assignments"),
        getCollection("checklists")
      ]);
      setAssignments(asgList || []);
      setChecklists(chkList || []);
    } catch (e) {
      console.error("Erro ao carregar vínculos e checklists", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const createAssignment = useCallback(
    async (
      formData: AssignmentFormData,
      signatureImage: string,
      photos: Record<string, string>,
      drivers: any[],
      vehicles: any[]
    ) => {
      try {
        const getDriverName = (id: string) => {
          const d = drivers.find(drv => drv.id === id);
          return d ? d.name : `Motorista (${id.substring(0, 6)})`;
        };

        const getVehicleInfo = (id: string) => {
          const v = vehicles.find(veh => veh.id === id);
          return v ? `${v.brand} ${v.model} (${v.plate})` : `Veículo (${id.substring(0, 6)})`;
        };

        // 1. Concurrency Check
        const latestAssignments = await getCollection("vehicle_assignments");
        const isVehicleAssigned = latestAssignments.some(a => a.active === true && a.vehicleId === formData.vehicleId);
        if (isVehicleAssigned) {
          throw new Error("O veículo selecionado já foi vinculado a outro motorista por outro operador.");
        }
        const isDriverAssigned = latestAssignments.some(a => a.active === true && a.driverId === formData.driverId);
        if (isDriverAssigned) {
          throw new Error("O motorista selecionado já possui um vínculo ativo com outro veículo.");
        }

        // 2. Create assignment record
        const newAsg = await addDocument("vehicle_assignments", {
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          contractId: formData.contractId,
          startDate: formData.startDate + "T08:00:00Z",
          endDate: null,
          active: true,
          status: "active"
        });

        // 3. Create mandatory Checklist de Entrega
        await addDocument("checklists", {
          assignmentId: newAsg.id,
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          type: "Entrega",
          date: formData.startDate,
          items: formData.checklist,
          signatureText: formData.signatureText || getDriverName(formData.driverId),
          signatureImage: signatureImage || "",
          photos: photos,
          signed: true
        });

        // 4. Update vehicle status to "locado"
        const vehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (vehicle) {
          await updateDocument("vehicles", vehicle.id, {
            status: "locado"
          });
        }

        // 5. Record Activity Timeline
        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: formData.vehicleId,
          eventType: "assignment",
          title: "Veículo Locado (Vínculo)",
          description: `Veículo associado ao motorista ${getDriverName(formData.driverId)} sob contrato.`,
          metadata: { driverId: formData.driverId, assignmentId: newAsg.id },
          createdBy: currentUser?.displayName || "Operador"
        });

        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: formData.driverId,
          eventType: "assignment",
          title: "Veículo Atribuído",
          description: `Motorista assumiu a direção do veículo ${getVehicleInfo(formData.vehicleId)}.`,
          metadata: { vehicleId: formData.vehicleId, assignmentId: newAsg.id },
          createdBy: currentUser?.displayName || "Operador"
        });

        await loadAssignments();
        return newAsg;
      } catch (err) {
        console.error("Erro ao registrar vínculo", err);
        throw err;
      }
    },
    [addDocument, updateDocument, getCollection, currentUser, loadAssignments]
  );

  const closeAssignment = useCallback(
    async (
      closingAssignment: Assignment,
      closeData: ReturnFormData,
      signatureImage: string,
      photos: Record<string, string>,
      drivers: any[],
      vehicles: any[]
    ) => {
      try {
        const getDriverName = (id: string) => {
          const d = drivers.find(drv => drv.id === id);
          return d ? d.name : `Motorista (${id.substring(0, 6)})`;
        };

        const getVehicleInfo = (id: string) => {
          const v = vehicles.find(veh => veh.id === id);
          return v ? `${v.brand} ${v.model} (${v.plate})` : `Veículo (${id.substring(0, 6)})`;
        };

        // 1. Mark assignment as completed
        await updateDocument("vehicle_assignments", closingAssignment.id, {
          active: false,
          endDate: closeData.endDate + "T18:00:00Z",
          status: "completed"
        });

        // 2. Create mandatory Checklist de Devolução
        await addDocument("checklists", {
          assignmentId: closingAssignment.id,
          vehicleId: closingAssignment.vehicleId,
          driverId: closingAssignment.driverId,
          type: "Devolução",
          date: closeData.endDate,
          items: closeData.checklist,
          signatureText: closeData.signatureText || getDriverName(closingAssignment.driverId),
          signatureImage: signatureImage || "",
          photos: photos,
          signed: true
        });

        // 3. Update vehicle status and mileage
        const vehicle = vehicles.find(v => v.id === closingAssignment.vehicleId);
        if (vehicle) {
          const updatedMileage = closeData.mileageEnd !== "" ? Number(closeData.mileageEnd) : vehicle.mileage;
          await updateDocument("vehicles", vehicle.id, {
            status: closeData.vehicleStatusAfter,
            mileage: Math.max(vehicle.mileage || 0, updatedMileage)
          });
        }

        // 4. Record Activity Timeline
        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: closingAssignment.vehicleId,
          eventType: "release",
          title: `Devolução (${closeData.vehicleStatusAfter})`,
          description: `Veículo devolvido pelo motorista ${getDriverName(closingAssignment.driverId)}. Destino: ${closeData.vehicleStatusAfter}.`,
          metadata: { driverId: closingAssignment.driverId, assignmentId: closingAssignment.id },
          createdBy: currentUser?.displayName || "Operador"
        });

        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: closingAssignment.driverId,
          eventType: "release",
          title: "Veículo Devolvido",
          description: `Motorista realizou a devolução do veículo ${getVehicleInfo(closingAssignment.vehicleId)}.`,
          metadata: { vehicleId: closingAssignment.vehicleId, assignmentId: closingAssignment.id },
          createdBy: currentUser?.displayName || "Operador"
        });

        await loadAssignments();
      } catch (err) {
        console.error("Erro ao fechar vínculo", err);
        throw err;
      }
    },
    [updateDocument, addDocument, currentUser, loadAssignments]
  );

  const createAvulsoChecklist = useCallback(
    async (
      avulsoForm: AuditFormData,
      signatureImage: string,
      photos: Record<string, string>,
      drivers: any[]
    ) => {
      try {
        const getDriverName = (id: string) => {
          const d = drivers.find(drv => drv.id === id);
          return d ? d.name : `Motorista (${id.substring(0, 6)})`;
        };

        // 1. Create audit checklist
        await addDocument("checklists", {
          vehicleId: avulsoForm.vehicleId,
          driverId: avulsoForm.driverId,
          type: avulsoForm.type,
          date: new Date().toISOString().split("T")[0],
          items: avulsoForm.checklist,
          signatureText: avulsoForm.signatureText || getDriverName(avulsoForm.driverId),
          signatureImage: signatureImage || "",
          photos: photos,
          signed: true
        });

        // 2. Record Activity
        await addDocument("activity_timeline", {
          entityType: "vehicle",
          entityId: avulsoForm.vehicleId,
          eventType: "checklist_avulso",
          title: `Auditoria: ${avulsoForm.type}`,
          description: `Checklist técnico avulso executado pelo motorista ${getDriverName(avulsoForm.driverId)}.`,
          metadata: { driverId: avulsoForm.driverId },
          createdBy: currentUser?.displayName || "Supervisor"
        });

        await loadAssignments();
      } catch (err) {
        console.error("Erro ao registrar auditoria", err);
        throw err;
      }
    },
    [addDocument, currentUser, loadAssignments]
  );

  return {
    assignments,
    checklists,
    loading,
    loadAssignments,
    createAssignment,
    closeAssignment,
    createAvulsoChecklist
  };
}
