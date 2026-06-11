import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Driver,
  Attachment,
  Occurrence,
  Infraction,
  LedgerEntry,
  DriverFormData,
  InfractionFormData,
  OccurrenceFormData,
  DocFormData,
  LedgerFormData
} from "../_lib/types";
import { isReadOnly } from "../_lib/helpers";

export function useDrivers() {
  const { currentUser, getCollection, addDocument, updateDocument, can } = useAuth();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        drvList,
        attList,
        asgList,
        vehList,
        conList,
        ledList,
        occList,
        infList,
        clmList,
        timelineList,
        tplList
      ] = await Promise.all([
        getCollection("drivers"),
        getCollection("attachments"),
        getCollection("vehicle_assignments"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("driver_ledger"),
        getCollection("driver_occurrences"),
        getCollection("driver_infractions"),
        getCollection("claims"),
        getCollection("activity_timeline"),
        getCollection("contract_templates")
      ]);
      setDrivers(drvList || []);
      setAttachments(attList || []);
      setAssignments(asgList || []);
      setVehicles(vehList || []);
      setContracts(conList || []);
      setLedger(ledList || []);
      setOccurrences(occList || []);
      setInfractions(infList || []);
      setClaims(clmList || []);
      setTimeline(timelineList || []);
      setTemplates(tplList || []);
    } catch (e) {
      console.error("Erro ao carregar prontuários de motoristas", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDriverBalance = useCallback((driverId: string) => {
    const entries = ledger.filter(l => l.driverId === driverId);
    return entries.reduce((acc, curr) => acc + curr.amount, 0);
  }, [ledger]);

  const savePersonalData = async (selectedDriver: Driver | null, formData: DriverFormData) => {
    if (selectedDriver && isReadOnly(selectedDriver)) return;

    try {
      if (selectedDriver) {
        await updateDocument("drivers", selectedDriver.id, formData);

        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: selectedDriver.id,
          eventType: "update_profile",
          title: "Ficha Cadastral Atualizada",
          description: `Os dados do prontuário de ${formData.name} foram atualizados.`,
          metadata: formData,
          createdBy: currentUser?.displayName || "Operador",
          createdAt: new Date().toISOString()
        });
      } else {
        const newDriver = await addDocument("drivers", {
          ...formData,
          activeLocks: [],
          lockJustification: {}
        });

        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: newDriver.id,
          eventType: "admission",
          title: "Admissão Registrada",
          description: `Motorista ${formData.name} foi admitido e seu prontuário operacional inicializado.`,
          metadata: formData,
          createdBy: currentUser?.displayName || "Operador",
          createdAt: new Date().toISOString()
        });
      }
      await loadData();
      alert("Cadastro salvo com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const saveLocks = async (selectedDriver: Driver, driverLocks: string[], lockJustification: Record<string, string>) => {
    if (isReadOnly(selectedDriver) && !can("users.manage")) {
      alert("Acesso Negado: Perfil Judicial/Administrativo ativo requer privilégios especiais.");
      return;
    }

    try {
      const isNowBlocked = driverLocks.length > 0;
      const status = isNowBlocked ? "blocked" : "active";

      await updateDocument("drivers", selectedDriver.id, {
        activeLocks: driverLocks,
        lockJustification: lockJustification,
        status: status
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "lock_change",
        title: isNowBlocked ? "Bloqueio Operacional Aplicado" : "Bloqueios Operacionais Removidos",
        description: isNowBlocked
          ? `Bloqueio(s) de ${driverLocks.join(", ")} aplicado(s). Justificativa: ${JSON.stringify(lockJustification)}`
          : "Todas as travas operacionais foram liberadas. Motorista apto a rodar.",
        metadata: { locks: driverLocks },
        createdBy: currentUser?.displayName || "Gestor",
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert("Regras de bloqueio operacional atualizadas com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const simulateContract = async (
    selectedDriver: Driver,
    selectedTemplateId: string,
    simulatedVehicleId: string,
    simulatedDailyRate: number
  ) => {
    const locks = selectedDriver.activeLocks || [];
    if (locks.includes("Documentação")) {
      alert("⚠️ ERRO: Assinatura de Contrato bloqueada. O prontuário possui restrição ativa de 'Documentação' (CNH ou CONDUTAX vencido ou ausente).");
      return;
    }
    if (locks.includes("Financeiro") || locks.includes("Conduta")) {
      alert("⚠️ ERRO: Assinatura de Contrato bloqueada por restrição operacional (Financeiro / Conduta ativo).");
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    const vehicle = vehicles.find(v => v.id === simulatedVehicleId);
    if (!template || !vehicle) return;

    try {
      const todayStr = new Date().toLocaleDateString("pt-BR");
      const bodyText = template.body
        .replace(/{{driver_name}}/g, selectedDriver.name)
        .replace(/{{vehicle_plate}}/g, vehicle.plate)
        .replace(/{{daily_rate}}/g, simulatedDailyRate.toString())
        .replace(/{{contract_date}}/g, todayStr);

      const newContract = await addDocument("contracts", {
        driverId: selectedDriver.id,
        vehicleId: vehicle.id,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        dailyRate: Number(simulatedDailyRate),
        weeklyRate: Number(simulatedDailyRate) * 7 * 0.9,
        monthlyRate: Number(simulatedDailyRate) * 30 * 0.85,
        status: "active",
        type: "Locação",
        pdfSignedUrl: "https://example.com/contrato_assinado.pdf",
        closedBy: ""
      });

      await updateDocument("vehicles", vehicle.id, {
        status: "locado"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "contract_signed",
        title: "Contrato Assinado Digitalmente",
        description: `Contrato de locação do veículo ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) gerado e assinado via token digital.`,
        metadata: { contractId: newContract.id, vehicleId: vehicle.id },
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: vehicle.id,
        eventType: "contract_signed",
        title: "Novo Contrato de Locação",
        description: `Contrato iniciado com o motorista ${selectedDriver.name}.`,
        metadata: { contractId: newContract.id, driverId: selectedDriver.id },
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert("Contrato assinado eletronicamente e veículo atribuído!");
    } catch (err) {
      console.error(err);
    }
  };

  const addOccurrence = async (selectedDriver: Driver, occurrenceForm: OccurrenceFormData) => {
    if (isReadOnly(selectedDriver)) return;

    try {
      const payload = {
        driverId: selectedDriver.id,
        type: occurrenceForm.type,
        description: occurrenceForm.description,
        date: new Date().toISOString().split("T")[0],
        reportedBy: currentUser?.displayName || "Operador"
      };

      await addDocument("driver_occurrences", payload);

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "occurrence",
        title: `Ocorrência: ${occurrenceForm.type}`,
        description: `Registrado por ${payload.reportedBy}: ${occurrenceForm.description}`,
        metadata: payload,
        createdBy: payload.reportedBy,
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert("Ocorrência lançada!");
    } catch (err) {
      console.error(err);
    }
  };

  const uploadDoc = async (selectedDriver: Driver, docForm: DocFormData) => {
    if (isReadOnly(selectedDriver)) return;

    try {
      await addDocument("attachments", {
        entityType: "driver",
        entityId: selectedDriver.id,
        fileName: docForm.fileName || "Documento_Ficha.pdf",
        fileUrl: docForm.fileUrl || "https://example.com/doc.pdf",
        uploadedBy: currentUser?.displayName || "Luiz Frota"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "document_upload",
        title: "Documento Digitalizado Anexado",
        description: `Arquivo '${docForm.fileName}' inserido no prontuário do motorista.`,
        metadata: { fileName: docForm.fileName },
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert("Documento anexado ao prontuário digital!");
    } catch (err) {
      console.error(err);
    }
  };

  const addLedgerEntry = async (selectedDriver: Driver, ledgerForm: LedgerFormData) => {
    if (isReadOnly(selectedDriver)) return;

    try {
      const amountVal = Number(ledgerForm.amount);
      const finalAmount =
        ledgerForm.type === "daily" ||
        ledgerForm.type === "fine" ||
        (ledgerForm.type === "adjustment" && amountVal < 0)
          ? -Math.abs(amountVal)
          : Math.abs(amountVal);

      const payload = {
        driverId: selectedDriver.id,
        type: ledgerForm.type,
        description: ledgerForm.description,
        amount: finalAmount,
        createdAt: new Date().toISOString()
      };

      await addDocument("driver_ledger", payload);

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "ledger_entry",
        title: `Lançamento: ${ledgerForm.type === "payment" ? "Crédito/Pagamento" : "Débito/Encargo"}`,
        description: `${ledgerForm.description} - Valor: R$ ${finalAmount.toFixed(2)}`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Financeiro",
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert("Movimentação de conta corrente lançada com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const addInfraction = async (selectedDriver: Driver, infractionForm: any) => {
    if (isReadOnly(selectedDriver)) return;

    try {
      const payload = {
        driverId: selectedDriver.id,
        date: infractionForm.date,
        ait: infractionForm.ait,
        agency: infractionForm.agency,
        vehicleId: infractionForm.vehicleId,
        points: Number(infractionForm.points),
        amount: Number(infractionForm.amount),
        description: infractionForm.description,
        responsible: infractionForm.responsible || currentUser?.displayName || "Operador",
        status: infractionForm.status
      };

      await addDocument("driver_infractions", payload);

      const currentPoints = (selectedDriver.cnhPoints || 0) + payload.points;
      const nowSuspended = currentPoints >= 40;
      await updateDocument("drivers", selectedDriver.id, {
        cnhPoints: currentPoints,
        cnhPointsUpdatedAt: new Date().toISOString().split("T")[0],
        ...(nowSuspended && { cnhSuspended: true })
      });

      if (nowSuspended && !selectedDriver.activeLocks?.includes("CNH Suspensa")) {
        const newLocks = [...(selectedDriver.activeLocks || []), "CNH Suspensa"];
        await updateDocument("drivers", selectedDriver.id, {
          activeLocks: newLocks,
          status: "blocked",
          lockJustification: {
            ...(selectedDriver.lockJustification || {}),
            "CNH Suspensa": `Pontuação atingiu ${currentPoints} pontos — bloqueio automático pelo sistema.`
          }
        });
      }

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: selectedDriver.id,
        eventType: "infraction",
        title: `Infração Registrada: ${payload.description}`,
        description: `AIT: ${payload.ait || "N/A"} — ${payload.points} pontos — R$ ${payload.amount}. Autuado por: ${payload.agency || "N/A"}`,
        metadata: payload,
        createdBy: currentUser?.displayName || "Operador",
        createdAt: new Date().toISOString()
      });

      await loadData();
      alert(
        nowSuspended
          ? `⚠️ ATENÇÃO: CNH atingiu ${currentPoints} pontos. Motorista bloqueado automaticamente por CNH Suspensa!`
          : "Infração registrada e pontuação CNH atualizada."
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDriver = async (id: string) => {
    if (confirm("⚠️ ATENÇÃO: Deseja arquivar este prontuário? O registro será mantido para auditoria (soft delete).")) {
      try {
        await updateDocument("drivers", id, { status: "archived", archivedAt: new Date().toISOString() });
        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: id,
          eventType: "archived",
          title: "Prontuário Arquivado",
          description: "Motorista arquivado pelo operador. Histórico preservado para fins de auditoria.",
          createdBy: currentUser?.displayName || "Operador",
          createdAt: new Date().toISOString()
        });
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return {
    drivers,
    attachments,
    assignments,
    vehicles,
    contracts,
    ledger,
    occurrences,
    infractions,
    claims,
    timeline,
    templates,
    loading,
    getDriverBalance,
    savePersonalData,
    saveLocks,
    simulateContract,
    addOccurrence,
    uploadDoc,
    addLedgerEntry,
    addInfraction,
    deleteDriver,
    loadData
  };
}
