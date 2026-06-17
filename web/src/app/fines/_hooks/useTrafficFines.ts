"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TrafficFine, TrafficFineStatus, FineAppeal, AppealType, FineTimelineEvent } from "../_lib/types";

export function useTrafficFines() {
  const { currentUser, getCollection, addDocument, updateDocument } = useAuth();

  const [fines, setFines] = useState<TrafficFine[]>([]);
  const [appeals, setAppeals] = useState<FineAppeal[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fineList, appealList, driverList, vehicleList, assignList, contractList] = await Promise.all([
        getCollection("traffic_fines"),
        getCollection("fine_appeals"),
        getCollection("drivers"),
        getCollection("vehicles"),
        getCollection("vehicle_assignments"),
        getCollection("contracts"),
      ]);
      setFines(fineList || []);
      setAppeals(appealList || []);
      setDrivers(driverList || []);
      setVehicles(vehicleList || []);
      setAssignments(assignList || []);
      setContracts(contractList || []);
    } catch (e) {
      console.error("[useTrafficFines] Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  useEffect(() => { loadData(); }, [loadData]);

  const reload = () => loadData();

  // ─── Sugestão automática de condutor ─────────────────────────────────────
  // Cruza plate + occurrenceDate com assignments e contracts para sugerir motorista
  const suggestDriver = (fine: TrafficFine): { driver: any; confidence: "high" | "medium" | "low" } | null => {
    if (!fine.vehicleId || !fine.occurrenceDate) return null;
    const occDate = fine.occurrenceDate.substring(0, 10);

    // 1. Tentar via assignments (vínculos diretos)
    const matchAssignment = assignments.find((a: any) => {
      const sameVehicle = a.vehicleId === fine.vehicleId;
      const started = !a.startDate || a.startDate <= occDate;
      const ended = !a.endDate || a.endDate >= occDate;
      const active = a.status === "active" || (!a.endDate);
      return sameVehicle && started && ended && active;
    });

    if (matchAssignment) {
      const driver = drivers.find((d: any) => d.id === matchAssignment.driverId);
      if (driver) return { driver, confidence: "high" };
    }

    // 2. Tentar via contracts
    const matchContract = contracts.find((c: any) => {
      const sameVehicle = c.vehicleId === fine.vehicleId;
      const started = !c.startDate || c.startDate <= occDate;
      const ended = !c.endDate || c.endDate >= occDate;
      const active = c.status === "active" || c.status === "Ativo";
      return sameVehicle && started && ended && active;
    });

    if (matchContract) {
      const driver = drivers.find((d: any) => d.id === matchContract.driverId);
      if (driver) return { driver, confidence: "medium" };
    }

    return null;
  };

  // ─── Pontos CNH acumulados do motorista ───────────────────────────────────
  const getDriverPoints = (driverId: string): number => {
    return fines
      .filter(f => f.driverId === driverId && f.status !== "appeal_granted" && f.status !== "archived")
      .reduce((sum, f) => sum + (f.points || 0), 0);
  };

  // ─── Valor vigente (considera desconto ativo) ─────────────────────────────
  const getEffectiveAmount = (fine: TrafficFine): number => {
    const today = new Date().toISOString().substring(0, 10);
    if (fine.discountDeadline && fine.discountDeadline >= today && fine.discountAmount > 0) {
      return fine.originalAmount - fine.discountAmount;
    }
    return fine.originalAmount;
  };

  // ─── Criar nova multa ─────────────────────────────────────────────────────
  const createFine = async (payload: Omit<TrafficFine, "id" | "createdAt" | "updatedAt" | "timeline">) => {
    try {
      const now = new Date().toISOString();
      const timeline: FineTimelineEvent[] = [{
        date: now,
        label: "Multa Recebida",
        detail: `AIT ${payload.noticeNumber} — ${payload.issuingAgency}`,
        actor: currentUser?.displayName || "Sistema",
      }];
      const fine = await addDocument("traffic_fines", {
        ...payload,
        status: payload.status || ("received" as TrafficFineStatus),
        identificationMethod: payload.identificationMethod || "pending",
        timeline,
        createdAt: now,
        updatedAt: now,
      });
      await loadData();
      return fine;
    } catch (e) {
      console.error("[useTrafficFines] Erro ao criar multa:", e);
      throw e;
    }
  };

  // ─── Confirmar condutor ────────────────────────────────────────────────────
  const confirmDriver = async (
    fineId: string,
    driverId: string,
    driverName: string,
    method: "auto" | "manual"
  ) => {
    try {
      const fine = fines.find(f => f.id === fineId);
      if (!fine) return;
      const now = new Date().toISOString();
      const event: FineTimelineEvent = {
        date: now,
        label: "Condutor Identificado",
        detail: `${driverName} (${method === "auto" ? "identificação automática" : "identificação manual"})`,
        actor: currentUser?.displayName || "Sistema",
      };
      await updateDocument("traffic_fines", fineId, {
        driverId,
        driverName,
        identificationMethod: method,
        status: "driver_identified" as TrafficFineStatus,
        timeline: [...(fine.timeline || []), event],
        updatedAt: now,
      });
      await loadData();
    } catch (e) {
      console.error("[useTrafficFines] Erro ao confirmar condutor:", e);
      throw e;
    }
  };

  // ─── Cobrar motorista → cria AR ────────────────────────────────────────────
  const chargeDriver = async (fineId: string) => {
    try {
      const fine = fines.find(f => f.id === fineId);
      if (!fine || !fine.driverId) throw new Error("Multa sem condutor identificado.");
      const now = new Date().toISOString();
      const effectiveAmount = getEffectiveAmount(fine);

      const ar = await addDocument("accounts_receivable", {
        driverId: fine.driverId,
        contractId: "",
        dueDate: fine.dueDate,
        amount: effectiveAmount,
        titleType: "fine",
        status: "open",
        paidAmount: 0,
        sourceId: fineId,
        sourceType: "traffic_fine",
        createdAt: now,
      });

      const event: FineTimelineEvent = {
        date: now,
        label: "Cobrança Gerada",
        detail: `Débito de R$ ${effectiveAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} criado para ${fine.driverName}`,
        actor: currentUser?.displayName || "Sistema",
      };

      await updateDocument("traffic_fines", fineId, {
        status: "charged" as TrafficFineStatus,
        arId: ar.id,
        timeline: [...(fine.timeline || []), event],
        updatedAt: now,
      });

      await loadData();
      return ar;
    } catch (e) {
      console.error("[useTrafficFines] Erro ao cobrar motorista:", e);
      throw e;
    }
  };

  // ─── Criar recurso ─────────────────────────────────────────────────────────
  const createAppeal = async (fineId: string, payload: {
    type: AppealType;
    grounds: string;
    deadline: string;
  }) => {
    try {
      const fine = fines.find(f => f.id === fineId);
      if (!fine) return;
      const now = new Date().toISOString();

      const appeal = await addDocument("fine_appeals", {
        fineId,
        type: payload.type,
        grounds: payload.grounds,
        submittedAt: now,
        deadline: payload.deadline,
        status: "pending",
        createdAt: now,
      });

      const event: FineTimelineEvent = {
        date: now,
        label: "Recurso Protocolado",
        detail: `Tipo: ${payload.type.toUpperCase()} · Prazo: ${new Date(payload.deadline).toLocaleDateString("pt-BR")}`,
        actor: currentUser?.displayName || "Sistema",
      };

      await updateDocument("traffic_fines", fineId, {
        status: "appealing" as TrafficFineStatus,
        appealId: appeal.id,
        timeline: [...(fine.timeline || []), event],
        updatedAt: now,
      });

      await loadData();
      return appeal;
    } catch (e) {
      console.error("[useTrafficFines] Erro ao criar recurso:", e);
      throw e;
    }
  };

  // ─── Resolver recurso ─────────────────────────────────────────────────────
  const resolveAppeal = async (
    appealId: string,
    result: "granted" | "denied",
    resultNotes: string
  ) => {
    try {
      const appeal = appeals.find(a => a.id === appealId);
      if (!appeal) return;
      const fine = fines.find(f => f.id === appeal.fineId);
      if (!fine) return;
      const now = new Date().toISOString();

      await updateDocument("fine_appeals", appealId, {
        status: result,
        result: resultNotes,
      });

      const newFineStatus: TrafficFineStatus = result === "granted" ? "appeal_granted" : "appeal_denied";
      const event: FineTimelineEvent = {
        date: now,
        label: result === "granted" ? "Recurso Deferido" : "Recurso Indeferido",
        detail: resultNotes,
        actor: currentUser?.displayName || "Sistema",
      };

      await updateDocument("traffic_fines", fine.id, {
        status: newFineStatus,
        timeline: [...(fine.timeline || []), event],
        updatedAt: now,
      });

      await loadData();
    } catch (e) {
      console.error("[useTrafficFines] Erro ao resolver recurso:", e);
      throw e;
    }
  };

  // ─── Gerar tarefa para despachante (multas DTP) ───────────────────────────
  const createDispatcherTask = async (fineId: string) => {
    try {
      const fine = fines.find(f => f.id === fineId);
      if (!fine) return;
      const now = new Date().toISOString();

      const task = await addDocument("dispatcher_tasks", {
        type: "dtp_fine_defense",
        fineId,
        vehicleId: fine.vehicleId,
        plate: fine.plate,
        description: `Defesa de Penalidade DTP: ${fine.description} (AIT ${fine.noticeNumber})`,
        dueDate: fine.dueDate,
        priority: "high",
        status: "pending",
        assignedTo: null,
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: now,
      });

      const event: FineTimelineEvent = {
        date: now,
        label: "Tarefa Enviada ao Despachante",
        detail: `Prazo de defesa: ${new Date(fine.dueDate).toLocaleDateString("pt-BR")}`,
        actor: currentUser?.displayName || "Sistema",
      };

      await updateDocument("traffic_fines", fineId, {
        dispatcherTaskId: task.id,
        timeline: [...(fine.timeline || []), event],
        updatedAt: now,
      });

      await loadData();
      return task;
    } catch (e) {
      console.error("[useTrafficFines] Erro ao criar tarefa DTP:", e);
      throw e;
    }
  };

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = {
    totalReceived: fines.filter(f => f.status === "received").length,
    pendingId: fines.filter(f => f.status === "pending_driver_id").length,
    totalToCollect: fines
      .filter(f => f.status === "driver_identified")
      .reduce((sum, f) => sum + getEffectiveAmount(f), 0),
    inAppeal: fines.filter(f => f.status === "appealing").length,
    expiringIn5Days: fines.filter(f => {
      if (f.status === "paid" || f.status === "archived" || f.status === "appeal_granted") return false;
      const daysUntil = (new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 5;
    }).length,
    discountExpiring: fines.filter(f => {
      if (!f.discountDeadline) return false;
      const daysUntil = (new Date(f.discountDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 3;
    }).length,
    totalPoints: fines
      .filter(f => f.status !== "appeal_granted" && f.status !== "archived")
      .reduce((sum, f) => sum + (f.points || 0), 0),
  };

  return {
    fines,
    appeals,
    drivers,
    vehicles,
    loading,
    reload,
    kpis,
    suggestDriver,
    getDriverPoints,
    getEffectiveAmount,
    createFine,
    confirmDriver,
    chargeDriver,
    createAppeal,
    resolveAppeal,
    createDispatcherTask,
  };
}
