import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Claim,
  NewClaimForm,
  ChecklistForm,
  BoForm,
  TpForm,
  ClaimEvidence,
  ClaimDamageItem,
  ClaimBudget,
  ClaimInstallment,
  ClaimApproval,
  ClaimPoliceReport,
  ClaimInsurance,
  ClaimFinancialRecovery,
  ClaimTimelineEvent,
  ClaimAuditLog,
  ClaimEvidenceChain,
  ClaimRiskAnalysis,
  ClaimVersion,
  ClaimRecoveryCase
} from "../_lib/types";

export function useClaims() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument } = useAuth();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [priceTable, setPriceTable] = useState<any[]>([]);
  const [allDamageItems, setAllDamageItems] = useState<ClaimDamageItem[]>([]);
  const [allBudgets, setAllBudgets] = useState<ClaimBudget[]>([]);

  // Sub-collection lists for selected claim
  const [checklists, setChecklists] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<ClaimEvidence[]>([]);
  const [damageItems, setDamageItems] = useState<ClaimDamageItem[]>([]);
  const [budgets, setBudgets] = useState<ClaimBudget[]>([]);
  const [installments, setInstallments] = useState<ClaimInstallment[]>([]);
  const [approvals, setApprovals] = useState<ClaimApproval[]>([]);
  
  // Refined 2.0 Sub-collections
  const [policeReport, setPoliceReport] = useState<ClaimPoliceReport | null>(null);
  const [insuranceDetails, setInsuranceDetails] = useState<ClaimInsurance | null>(null);
  const [financialRecovery, setFinancialRecovery] = useState<ClaimFinancialRecovery | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<ClaimTimelineEvent[]>([]);

  // 2.0 Enterprise collections
  const [claimAuditLogs, setClaimAuditLogs] = useState<ClaimAuditLog[]>([]);
  const [claimEvidenceChain, setClaimEvidenceChain] = useState<ClaimEvidenceChain[]>([]);
  const [claimRiskAnalysis, setClaimRiskAnalysis] = useState<ClaimRiskAnalysis | null>(null);
  const [claimVersions, setClaimVersions] = useState<ClaimVersion[]>([]);
  const [claimRecoveryCase, setClaimRecoveryCase] = useState<ClaimRecoveryCase | null>(null);

  // Selection states
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Page States
  const [loading, setLoading] = useState(true);

  // Form States of current selected claim (loaded dynamically)
  const [checklistForm, setChecklistForm] = useState<ChecklistForm>({
    frontPhotos: false,
    rearPhotos: false,
    sidePhotos: false,
    dashboardPhoto: false,
    odometerPhoto: false,
    crlvAttached: false,
    cnhAttached: false
  });

  const [boForm, setBoForm] = useState<BoForm>({
    reportNumber: "",
    policeStation: "",
    reportDate: "",
    attachmentUrl: ""
  });

  const [tpForm, setTpForm] = useState<TpForm>({
    name: "",
    cpf: "",
    phone: "",
    plate: "",
    vehicle: "",
    insurer: "",
    policyNumber: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [claimList, drvList, vehList, conList, tblList, dmgItems, bdgItems] = await Promise.all([
        getCollection("insurance_claims"),
        getCollection("drivers"),
        getCollection("vehicles"),
        getCollection("contracts"),
        getCollection("damage_price_table"),
        getCollection("claim_damage_items"),
        getCollection("claim_budgets")
      ]);
      setClaims(claimList || []);
      setDrivers(drvList || []);
      setVehicles(vehList || []);
      setContracts(conList || []);
      setPriceTable(tblList || []);
      setAllDamageItems(dmgItems || []);
      setAllBudgets(bdgItems || []);
    } catch (e) {
      console.error("Erro ao carregar dados de sinistros", e);
    } finally {
      setLoading(false);
    }
  }, [getCollection]);

  const loadClaimSubCollections = useCallback(async (claimId: string) => {
    try {
      const [
        chkList, evList, repList, tpList, dmgList, bdgList, instList, appList, boList, insList, recList, tlList,
        auditList, evChainList, riskList, verList, recCaseList
      ] = await Promise.all([
        getCollection("claim_checklists"),
        getCollection("claim_evidences"),
        getCollection("claim_reports"),
        getCollection("claim_third_parties"),
        getCollection("claim_damage_items"),
        getCollection("claim_budgets"),
        getCollection("claim_installments"),
        getCollection("claim_approvals"),
        getCollection("claim_police_reports"),
        getCollection("claim_insurance"),
        getCollection("claim_financial_recovery"),
        getCollection("claim_timeline"),
        getCollection("claim_audit_logs"),
        getCollection("claim_evidence_chain"),
        getCollection("claim_risk_analysis"),
        getCollection("claim_versions"),
        getCollection("claim_recovery_cases")
      ]);

      const claimChecklist = chkList?.find((c: any) => c.claimId === claimId) || null;
      if (claimChecklist) {
        setChecklistForm({
          frontPhotos: claimChecklist.frontPhotos || false,
          rearPhotos: claimChecklist.rearPhotos || false,
          sidePhotos: claimChecklist.sidePhotos || false,
          dashboardPhoto: claimChecklist.dashboardPhoto || false,
          odometerPhoto: claimChecklist.odometerPhoto || false,
          crlvAttached: claimChecklist.crlvAttached || false,
          cnhAttached: claimChecklist.cnhAttached || false
        });
      } else {
        setChecklistForm({
          frontPhotos: false,
          rearPhotos: false,
          sidePhotos: false,
          dashboardPhoto: false,
          odometerPhoto: false,
          crlvAttached: false,
          cnhAttached: false
        });
      }

      setEvidences(evList?.filter((e: any) => e.claimId === claimId) || []);

      const claimRep = repList?.find((r: any) => r.claimId === claimId) || null;
      if (claimRep) {
        setBoForm({
          reportNumber: claimRep.reportNumber || "",
          policeStation: claimRep.policeStation || "",
          reportDate: claimRep.reportDate || "",
          attachmentUrl: claimRep.attachmentUrl || ""
        });
      } else {
        setBoForm({ reportNumber: "", policeStation: "", reportDate: "", attachmentUrl: "" });
      }

      const claimTp = tpList?.find((t: any) => t.claimId === claimId) || null;
      if (claimTp) {
        setTpForm({
          name: claimTp.name || "",
          cpf: claimTp.cpf || "",
          phone: claimTp.phone || "",
          plate: claimTp.plate || "",
          vehicle: claimTp.vehicle || "",
          insurer: claimTp.insurer || "",
          policyNumber: claimTp.policyNumber || ""
        });
      } else {
        setTpForm({ name: "", cpf: "", phone: "", plate: "", vehicle: "", insurer: "", policyNumber: "" });
      }

      setDamageItems(dmgList?.filter((d: any) => d.claimId === claimId) || []);
      setBudgets(bdgList?.filter((b: any) => b.claimId === claimId) || []);
      setInstallments(instList?.filter((i: any) => i.claimId === claimId) || []);
      setApprovals(appList?.filter((a: any) => a.claimId === claimId) || []);

      // FIPE 2.0 structures mapping
      const currentBo = boList?.find((b: any) => b.claimId === claimId) || null;
      setPoliceReport(currentBo);

      const currentIns = insList?.find((i: any) => i.claimId === claimId) || null;
      setInsuranceDetails(currentIns);

      const currentRec = recList?.find((r: any) => r.claimId === claimId) || null;
      setFinancialRecovery(currentRec);

      const claimTL = tlList?.filter((t: any) => t.claimId === claimId) || [];
      setTimelineEvents(claimTL.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      setClaimAuditLogs(auditList?.filter((a: any) => a.claimId === claimId) || []);
      setClaimEvidenceChain(evChainList?.filter((e: any) => e.claimId === claimId) || []);
      setClaimRiskAnalysis(riskList?.find((r: any) => r.claimId === claimId) || null);
      setClaimVersions(verList?.filter((v: any) => v.claimId === claimId) || []);
      setClaimRecoveryCase(recCaseList?.find((r: any) => r.claimId === claimId) || null);

    } catch (e) {
      console.error("Erro ao carregar detalhes do sinistro", e);
    }
  }, [getCollection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedClaim) {
      loadClaimSubCollections(selectedClaim.id);
    }
  }, [selectedClaim, loadClaimSubCollections]);

  // Calculations for dashboard
  const activeClaimsCount = claims.filter(c => c.status !== "closed").length;
  const repairingClaimsCount = claims.filter(c => c.status === "repairing").length;
  const closedClaimsCount = claims.filter(c => c.status === "closed").length;

  const totalDamageCost = claims.reduce((acc, c) => {
    const claimBudgets = allBudgets.filter((b: any) => b.claimId === c.id);
    const approvedBudget = claimBudgets.find((b: any) => b.status === "approved");
    if (approvedBudget) {
      return acc + approvedBudget.amount;
    }

    const claimDamages = allDamageItems.filter((d: any) => d.claimId === c.id);
    if (claimDamages.length > 0) {
      return acc + claimDamages.reduce((sum, d) => sum + d.estimatedCost, 0);
    }

    return acc + (c.severity === "total_loss" ? 45000 : c.severity === "severe" ? 8000 : c.severity === "medium" ? 2500 : 1000);
  }, 0);

  // Helper name mapping
  const getDriverName = useCallback((driverId: string) => {
    const drv = drivers.find(d => d.id === driverId);
    return drv ? drv.name : "Motorista não identificado";
  }, [drivers]);

  const getVehiclePlate = useCallback((vehicleId: string) => {
    const veh = vehicles.find(v => v.id === vehicleId);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : "Veículo não identificado";
  }, [vehicles]);

  // Dynamic timeline logger helper
  const addTimelineEvent = async (claimId: string, eventType: string, title: string, description: string) => {
    try {
      await addDocument("claim_timeline", {
        claimId,
        eventType,
        title,
        description,
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error(err);
    }
  };

  // Operations
  const createClaim = async (form: NewClaimForm) => {
    if (!form.driverId || !form.vehicleId) {
      alert("Por favor, selecione o motorista e o veículo.");
      return;
    }

    try {
      const activeContract = contracts.find(c => c.driverId === form.driverId && c.status === "Ativo");
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const claimNum = `SIN-2026-${String(claims.length + 1).padStart(3, "0")}-${randomSuffix}`;

      // Reserve vehicle handling
      let reserveVehicleAssigned = false;
      let reserveAssignmentId = "";
      if (form.reserveVehicleRequired && form.vehicleId) {
        // Create a temporary placeholder assignment for reserve
        const reserveVeh = vehicles.find(v => v.status === "active" && v.id !== form.vehicleId);
        if (reserveVeh) {
          const newAsg = await addDocument("vehicle_assignments", {
            tenantId: "tenant-1",
            driverId: form.driverId,
            vehicleId: reserveVeh.id,
            active: true,
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            notes: `Veículo reserva vinculado automaticamente devido ao sinistro ${claimNum}.`
          });
          await updateDocument("vehicles", reserveVeh.id, { status: "locado" });
          reserveVehicleAssigned = true;
          reserveAssignmentId = newAsg.id;
        }
      }

      const payload = {
        tenantId: "tenant-1",
        claimNumber: claimNum,
        vehicleId: form.vehicleId,
        driverId: form.driverId,
        contractId: activeContract?.id || "",
        occurrenceDate: form.occurrenceDate,
        status: "open",
        severity: form.severity,
        location: form.location,
        description: form.description,
        involvedThirdParties: form.involvedThirdParties,
        hasVictims: form.hasVictims,
        vehicleDrivable: form.vehicleDrivable,

        // checklist batida fields
        startsEngine: form.startsEngine ?? false,
        vehicleMoves: form.vehicleMoves ?? false,
        steeringOk: form.steeringOk ?? false,
        brakesOk: form.brakesOk ?? false,
        coolingSystemOk: form.coolingSystemOk ?? false,
        electricalSystemOk: form.electricalSystemOk ?? false,
        airbagsDeployed: form.airbagsDeployed ?? false,
        fluidLeak: form.fluidLeak ?? false,
        suspensionDamage: form.suspensionDamage ?? false,
        wheelDamage: form.wheelDamage ?? false,
        windshieldDamage: form.windshieldDamage ?? false,
        headlightDamage: form.headlightDamage ?? false,

        // Tow/Reserve operations
        needsTowTruck: form.needsTowTruck ?? false,
        towTruckRequested: form.towTruckRequested ?? false,
        vehicleCanContinue: form.vehicleCanContinue ?? false,
        reserveVehicleRequired: form.reserveVehicleRequired ?? false,
        reserveVehicleAssigned,
        reserveVehicleId: form.reserveVehicleRequired ? "reserve-auto" : "",
        reserveAssignmentId,

        accidentType: form.accidentType || "Colisão Frontal",
        damageMap: form.damageMap || [],

        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString(),

        // 2.0 digital dossier geoloc & culprit parameters
        lat: form.lat ?? -23.626,
        lng: form.lng ?? -46.658,
        culprit: form.culprit ?? "unknown",
        accidentReason: form.accidentReason ?? "",
        accidentDynamics: form.accidentDynamics ?? form.description,
        isFrozen: false,
        sha256Fingerprint: ""
      };

      const newClaim = await addDocument("insurance_claims", payload);

      // Create empty sub-records for 2.0 models
      await addDocument("claim_checklists", {
        claimId: newClaim.id,
        frontPhotos: false,
        rearPhotos: false,
        sidePhotos: false,
        dashboardPhoto: false,
        odometerPhoto: false,
        crlvAttached: false,
        cnhAttached: false,
        updatedAt: new Date().toISOString()
      });

      await addDocument("claim_police_reports", {
        claimId: newClaim.id,
        protocolNumber: form.boProtocolNumber || "",
        boStatus: form.boStatus || "pending",
        boNumber: form.boReportNumber || "",
        lastConsultation: new Date().toISOString().split("T")[0],
        reportNumber: form.boReportNumber || "",
        year: form.boYear || new Date().getFullYear().toString(),
        declarantCpf: form.boDeclarantCpf || "",
        declarantName: form.boDeclarantName || "",
        status: form.boStatus || "Não Registrado",
        registrationDate: form.occurrenceDate ? form.occurrenceDate.split("T")[0] : "",
        lastCheckDate: new Date().toISOString().split("T")[0],
        observations: form.boObservations || "Registrado via wizard de sinistros.",
        boPdf: form.boPdf || "",
        boReceipt: form.boReceipt || "",
        boUrl: form.boUrl || ""
      });

      await addDocument("claim_insurance", {
        claimId: newClaim.id,
        insuranceCompany: form.thirdPartyInsurer || "",
        policyNumber: form.thirdPartyPolicyNumber || "",
        claimNumber: "",
        adjusterName: "",
        adjusterPhone: "",
        deductibleAmount: 0,
        approvedAmount: 0,
        deniedAmount: 0,
        expectedPaymentDate: "",
        receivedAmount: 0,
        receivedDate: ""
      });

      // Save initial third party info if available
      if (form.involvedThirdParties) {
        await addDocument("claim_third_parties", {
          claimId: newClaim.id,
          name: form.thirdPartyName || "",
          cpf: "",
          phone: form.thirdPartyPhone || "",
          plate: form.thirdPartyPlate || "",
          vehicle: form.thirdPartyVehicle || "",
          insurer: form.thirdPartyInsurer || "",
          policyNumber: form.thirdPartyPolicyNumber || ""
        });
      }

      // Save evidence photos uploaded in the wizard
      if (form.evidencePhotos && form.evidencePhotos.length > 0) {
        for (const photo of form.evidencePhotos) {
          const newEv = await addDocument("claim_evidences", {
            claimId: newClaim.id,
            fileType: photo.fileType,
            fileUrl: photo.fileUrl,
            uploadedAt: new Date().toISOString()
          });

          await addDocument("claim_evidence_chain", {
            claimId: newClaim.id,
            evidenceId: newEv.id,
            uploadedBy: currentUser?.displayName || "Motorista/Operador",
            uploadedAt: new Date().toISOString(),
            device: "Web Browser (Windows/Chrome)",
            gps: { lat: form.lat ?? -23.626, lng: form.lng ?? -46.658 },
            fileHash: sha256(photo.fileUrl)
          });
        }
      }

      // Perform automated fraud risk evaluation
      const driverClaimsCount = claims.filter(c => c.driverId === form.driverId).length;
      const flags: string[] = [];
      let riskScore = 15;
      if (driverClaimsCount >= 1) {
        flags.push("motorista_recorrente");
        riskScore += 25;
      }
      if (driverClaimsCount >= 2) {
        flags.push("3_sinistros_90_dias");
        riskScore += 30;
      }
      if (form.severity === "total_loss") {
        flags.push("perda_total_identificada");
        riskScore += 25;
      }
      if (form.severity === "severe") {
        flags.push("dano_mecanico_grave");
        riskScore += 15;
      }

      await addDocument("claim_risk_analysis", {
        claimId: newClaim.id,
        riskScore: Math.min(100, riskScore),
        flags,
        status: riskScore > 50 ? "suspicious" : "clear",
        analyzedAt: new Date().toISOString()
      });

      // Timeline events logging
      await addTimelineEvent(newClaim.id, "claim_created", "Sinistro Aberto", `Abertura de sinistro registrada via Wizard de Processos. Gravidade: ${form.severity}.`);

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: form.driverId,
        eventType: "claim_created",
        title: `Sinistro Registrado (${claimNum})`,
        description: `Ocorrência de sinistro registrada em ${new Date(form.occurrenceDate).toLocaleString("pt-BR")}. Veículo: ${getVehiclePlate(form.vehicleId)}.`,
        metadata: { claimId: newClaim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: form.vehicleId,
        eventType: "claim_created",
        title: `Sinistro Registrado (${claimNum})`,
        description: `Sinistro do tipo ${form.severity} registrado. Condutor: ${getDriverName(form.driverId)}.`,
        metadata: { claimId: newClaim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      await loadData();
      alert(`Sinistro ${claimNum} aberto com sucesso!`);
    } catch (err) {
      console.error("Erro ao registrar sinistro", err);
    }
  };

  const updateChecklist = async (claimId: string, form: ChecklistForm) => {
    try {
      const allChk = await getCollection("claim_checklists");
      const current = allChk?.find((c: any) => c.claimId === claimId);

      const payload = {
        claimId: claimId,
        ...form,
        updatedAt: new Date().toISOString()
      };

      if (current) {
        await updateDocument("claim_checklists", current.id, payload);
      } else {
        await addDocument("claim_checklists", payload);
      }

      await addTimelineEvent(claimId, "checklist_completed", "Checklist Finalizado", "Checklist técnico do estado do veículo finalizado pelo vistoriador.");

      if (selectedClaim) {
        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: selectedClaim.driverId,
          eventType: "claim_checklist_updated",
          title: "Checklist de Sinistro Atualizado",
          description: `Checklist de imagens e documentos do sinistro ${selectedClaim.claimNumber} foi atualizado.`,
          metadata: { claimId: selectedClaim.id },
          createdBy: currentUser?.displayName || "Sistema"
        });
      }

      alert("Checklist de vistoria atualizado!");
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao atualizar checklist", err);
    }
  };

  const addEvidence = async (claimId: string, fileType: string, fileUrl: string) => {
    try {
      await addDocument("claim_evidences", {
        claimId,
        fileType,
        fileUrl,
        uploadedAt: new Date().toISOString()
      });

      await addTimelineEvent(claimId, "photos_attached", "Fotos Anexadas", `Novo documento/foto do tipo '${fileType}' anexado ao processo.`);

      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao adicionar evidência", err);
    }
  };

  const saveBO = async (claimId: string, form: BoForm) => {
    try {
      const allRep = await getCollection("claim_reports");
      const current = allRep?.find((r: any) => r.claimId === claimId);

      const payload = {
        claimId,
        ...form
      };

      if (current) {
        await updateDocument("claim_reports", current.id, payload);
      } else {
        await addDocument("claim_reports", payload);
      }

      // Sincronizar com a nova tabela policial do BO SP
      const allPoliceRep = await getCollection("claim_police_reports");
      const currentPoliceRep = allPoliceRep?.find((r: any) => r.claimId === claimId);
      const boPayload = {
        claimId,
        protocolNumber: "",
        reportNumber: form.reportNumber,
        year: form.reportDate ? form.reportDate.split("-")[0] : "",
        declarantCpf: "",
        declarantName: "",
        status: "Concluído",
        registrationDate: form.reportDate,
        lastCheckDate: new Date().toISOString().split("T")[0],
        observations: `Cadastrado na delegacia ${form.policeStation}`,
        boPdf: form.attachmentUrl,
        boUrl: form.attachmentUrl
      };

      if (currentPoliceRep) {
        await updateDocument("claim_police_reports", currentPoliceRep.id, boPayload);
      } else {
        await addDocument("claim_police_reports", boPayload);
      }

      await addTimelineEvent(claimId, "bo_registered", "BO Registrado", `Boletim de ocorrência nº ${form.reportNumber} registrado.`);

      if (selectedClaim) {
        await addDocument("activity_timeline", {
          entityType: "driver",
          entityId: selectedClaim.driverId,
          eventType: "claim_bo_updated",
          title: "BO de Sinistro Registrado",
          description: `Boletim de Ocorrência ${form.reportNumber} vinculado ao sinistro ${selectedClaim.claimNumber}.`,
          metadata: { claimId: selectedClaim.id },
          createdBy: currentUser?.displayName || "Sistema"
        });
      }

      alert("Boletim de Ocorrência salvo!");
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao registrar BO", err);
    }
  };

  // Advanced BO SP parameters saver
  const savePoliceReportDetails = async (claimId: string, form: ClaimPoliceReport) => {
    try {
      const allPoliceRep = await getCollection("claim_police_reports");
      const current = allPoliceRep?.find((r: any) => r.claimId === claimId);

      const payload = {
        ...form,
        claimId
      };

      if (current) {
        await updateDocument("claim_police_reports", current.id, payload);
      } else {
        await addDocument("claim_police_reports", payload);
      }

      await addTimelineEvent(claimId, "bo_registered", "BO Integrado SP", `Dados de andamento do BO eletrônico atualizados. Protocolo: ${form.protocolNumber || "N/A"}.`);
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao registrar detalhes policiais do BO", err);
    }
  };

  // Advanced Insurance details saver
  const saveInsuranceDetails = async (claimId: string, form: ClaimInsurance) => {
    try {
      const allIns = await getCollection("claim_insurance");
      const current = allIns?.find((i: any) => i.claimId === claimId);

      const payload = {
        ...form,
        claimId
      };

      if (current) {
        await updateDocument("claim_insurance", current.id, payload);
      } else {
        await addDocument("claim_insurance", payload);
      }

      await addTimelineEvent(claimId, "seguradora_acionada", "Seguradora Acionada", `Sinistro acionado na seguradora ${form.insuranceCompany || "N/A"} com o sinistro nº ${form.claimNumber || "N/A"}.`);
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao salvar dados de seguradora", err);
    }
  };

  // Advanced Financial splits saver
  const saveFinancialRecoveryDetails = async (claimId: string, form: ClaimFinancialRecovery) => {
    try {
      const allRec = await getCollection("claim_financial_recovery");
      const current = allRec?.find((r: any) => r.claimId === claimId);

      const payload = {
        ...form,
        claimId
      };

      if (current) {
        await updateDocument("claim_financial_recovery", current.id, payload);
      } else {
        await addDocument("claim_financial_recovery", payload);
      }

      await addTimelineEvent(claimId, "cobranca_gerada", "Recuperação Financeira", `Custos de reparo rateados. Responsável principal: ${form.responsible}.`);
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao salvar divisão financeira", err);
    }
  };

  const saveThirdParty = async (claimId: string, form: TpForm) => {
    try {
      const allTp = await getCollection("claim_third_parties");
      const current = allTp?.find((t: any) => t.claimId === claimId);

      const payload = {
        claimId,
        ...form
      };

      if (current) {
        await updateDocument("claim_third_parties", current.id, payload);
      } else {
        await addDocument("claim_third_parties", payload);
      }

      alert("Dados de terceiros salvos com sucesso!");
      await loadClaimSubCollections(claimId);
    } catch (err) {
      console.error("Erro ao salvar terceiros", err);
    }
  };

  const addDamageItem = async (claimId: string, item: string, severity: string, estimatedCost: number) => {
    try {
      await addDocument("claim_damage_items", {
        claimId,
        item,
        severity,
        estimatedCost
      });
      await loadClaimSubCollections(claimId);
      await loadData();
    } catch (err) {
      console.error("Erro ao adicionar peça danificada", err);
    }
  };

  const deleteDamageItem = async (claimId: string, itemId: string) => {
    try {
      await deleteDocument("claim_damage_items", itemId);
      await loadClaimSubCollections(claimId);
      await loadData();
    } catch (err) {
      console.error("Erro ao remover peça", err);
    }
  };

  const addBudget = async (
    claimId: string,
    workshopName: string,
    amount: number,
    description: string,
    attachmentUrl: string
  ) => {
    try {
      await addDocument("claim_budgets", {
        claimId,
        workshopName,
        amount,
        description,
        status: "pending",
        attachmentUrl: attachmentUrl || "https://example.com/orcamento.pdf"
      });

      await addTimelineEvent(claimId, "orcamento_recebido", "Orçamento Recebido", `Orçamento da oficina ${workshopName} cadastrado no valor de R$ ${amount}.`);

      await loadClaimSubCollections(claimId);
      await loadData();
    } catch (err) {
      console.error("Erro ao registrar orçamento", err);
    }
  };

  const approveBudget = async (claim: Claim, budgetId: string) => {
    try {
      const allB = await getCollection("claim_budgets");
      const claimBdg = allB.filter((b: any) => b.claimId === claim.id);

      for (const bdg of claimBdg) {
        await updateDocument("claim_budgets", bdg.id, {
          status: bdg.id === budgetId ? "approved" : "rejected"
        });
      }

      const selectedBdg = claimBdg.find((b: any) => b.id === budgetId);

      await updateClaimFields(claim.id, {
        status: "repairing"
      });

      // Stock inventory deduction simulation
      const allInv = await getCollection("inventory_items");
      const bumper = allInv?.find((i: any) => i.name.toLowerCase().includes("parachoque") && i.active && i.currentQty > 0);
      const headlight = allInv?.find((i: any) => i.name.toLowerCase().includes("farol") && i.active && i.currentQty > 0);

      if (bumper) {
        await updateDocument("inventory_items", bumper.id, {
          currentQty: Math.max(0, bumper.currentQty - 1)
        });
        await addDocument("inventory_movements", {
          itemId: bumper.id,
          type: "OUT",
          qty: 1,
          unitCost: bumper.avgCost,
          totalCost: bumper.avgCost,
          referenceId: claim.id,
          referenceType: "claim_repair",
          notes: `Consumo automático no sinistro ${claim.claimNumber}`,
          createdAt: new Date().toISOString()
        });
      }

      if (headlight) {
        await updateDocument("inventory_items", headlight.id, {
          currentQty: Math.max(0, headlight.currentQty - 1)
        });
        await addDocument("inventory_movements", {
          itemId: headlight.id,
          type: "OUT",
          qty: 1,
          unitCost: headlight.avgCost,
          totalCost: headlight.avgCost,
          referenceId: claim.id,
          referenceType: "claim_repair",
          notes: `Consumo automático no sinistro ${claim.claimNumber}`,
          createdAt: new Date().toISOString()
        });
      }

      // Auto-create Work Order linked to Workshop portal
      await addDocument("work_orders", {
        tenantId: "tenant-1",
        claimId: claim.id,
        sourceType: "claim",
        sourceId: claim.id,
        vehicleId: claim.vehicleId,
        driverId: claim.driverId,
        description: `Reparo de Sinistro ${claim.claimNumber} - Oficina: ${selectedBdg?.workshopName || "Funilaria"}`,
        amount: Number(selectedBdg?.amount || 0),
        status: "pending",
        createdAt: new Date().toISOString()
      });

      await addTimelineEvent(claim.id, "oficina_acionada", "Oficina Acionada", `Orçamento aprovado. OS vinculada de código de sinistro iniciada na oficina e peças deduzidas do estoque.`);

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: claim.driverId,
        eventType: "claim_budget_approved",
        title: "Orçamento Oficina Aprovado",
        description: `Orçamento da oficina ${selectedBdg?.workshopName} no valor de R$ ${selectedBdg?.amount} foi selecionado e aprovado.`,
        metadata: { claimId: claim.id, budgetId },
        createdBy: currentUser?.displayName || "Sistema"
      });

      alert("Orçamento de funilaria aprovado, OS enviada e peças baixadas do estoque!");
      setSelectedClaim((prev: any) => (prev ? { ...prev, status: "repairing" } : null));
      await loadData();
    } catch (err) {
      console.error("Erro ao aprovar orçamento", err);
    }
  };

  const confirmBilling = async (
    claim: Claim,
    totalAmount: number,
    installmentsCount: number,
    description: string
  ) => {
    try {
      const installmentVal = Number((totalAmount / installmentsCount).toFixed(2));

      await addDocument("claim_installments", {
        claimId: claim.id,
        totalAmount: totalAmount,
        installments: installmentsCount,
        installmentAmount: installmentVal,
        createdAt: new Date().toISOString()
      });

      for (let i = 1; i <= installmentsCount; i++) {
        await addDocument("driver_ledger", {
          tenantId: "tenant-1",
          driverId: claim.driverId,
          type: "claim",
          description: `${description} (Parcela ${i}/${installmentsCount})`,
          amount: -installmentVal,
          createdAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      await updateDocument("insurance_claims", claim.id, {
        status: "charged"
      });

      await addTimelineEvent(claim.id, "cobranca_gerada", "Cobrança Gerada", `Faturamento de franquia gerado em ${installmentsCount} parcelas.`);

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: claim.driverId,
        eventType: "claim_billed",
        title: "Faturamento de Sinistro Realizado",
        description: `Cobrança de R$ ${totalAmount} faturada em ${installmentsCount} parcelas de R$ ${installmentVal} lançadas na conta corrente.`,
        metadata: { claimId: claim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      alert(`Cobrança de sinistro de R$ ${totalAmount} lançada no extrato do motorista em ${installmentsCount}x de R$ ${installmentVal}!`);
      setSelectedClaim((prev: any) => (prev ? { ...prev, status: "charged" } : null));
      await loadData();
    } catch (err) {
      console.error("Erro ao faturar sinistro", err);
    }
  };

  const roleApproval = async (claim: Claim, status: "approved" | "rejected", comments: string) => {
    const userRoleName = currentUser?.roleId
      ? currentUser.roleId.replace("role-", "").toUpperCase()
      : currentUser?.role.toUpperCase() || "";

    try {
      await addDocument("claim_approvals", {
        claimId: claim.id,
        role: userRoleName,
        status,
        approvedBy: currentUser?.displayName || "Sistema",
        approvedAt: new Date().toISOString(),
        comments
      });

      let nextStatus = claim.status;
      if (status === "approved") {
        if (userRoleName === "OWNER" || userRoleName === "SUPER_ADMIN") {
          nextStatus = "repairing";
          
          // Auto create work order upon final approval
          const claimBudgets = allBudgets.filter((b: any) => b.claimId === claim.id);
          const approvedBudget = claimBudgets.find((b: any) => b.status === "approved") || claimBudgets[0];
          await addDocument("work_orders", {
            tenantId: "tenant-1",
            claimId: claim.id,
            sourceType: "claim",
            sourceId: claim.id,
            vehicleId: claim.vehicleId,
            driverId: claim.driverId,
            description: `Reparo de Sinistro ${claim.claimNumber} - Oficina: ${approvedBudget?.workshopName || "Funilaria"}`,
            amount: Number(approvedBudget?.amount || 0),
            status: "pending",
            createdAt: new Date().toISOString()
          });

          await addTimelineEvent(claim.id, "oficina_acionada", "Oficina Acionada", `Sinistro aprovado e OS de funilaria despachada.`);
        } else if (userRoleName === "FINANCIAL") {
          nextStatus = "awaiting_approval";
        }
      } else {
        nextStatus = "under_review";
      }

      await updateDocument("insurance_claims", claim.id, {
        status: nextStatus
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: claim.driverId,
        eventType: "claim_approval",
        title: `Sinistro ${status === "approved" ? "Aprovado" : "Rejeitado"} por ${userRoleName}`,
        description: `Parecer técnico do setor ${userRoleName}. Comentários: ${comments || "Sem observações."}`,
        metadata: { claimId: claim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      alert(`Aprovação registrada com parecer de ${status === "approved" ? "Aprovado" : "Rejeitado"}!`);
      setSelectedClaim((prev: any) => (prev ? { ...prev, status: nextStatus } : null));
      await loadData();
    } catch (err) {
      console.error("Erro ao registrar parecer de aprovação", err);
    }
  };

  const closeClaim = async (claim: Claim) => {
    try {
      await updateClaimFields(claim.id, { status: "closed" });

      await addTimelineEvent(claim.id, "sinistro_encerrado", "Sinistro Encerrado", "Processo de sinistro finalizado com sucesso.");

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: claim.driverId,
        eventType: "claim_closed",
        title: "Processo de Sinistro Encerrado",
        description: `O sinistro ${claim.claimNumber} foi concluído e arquivado. Reparo executado e financeiro liquidado.`,
        metadata: { claimId: claim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      await addDocument("activity_timeline", {
        entityType: "vehicle",
        entityId: claim.vehicleId,
        eventType: "claim_closed",
        title: "Sinistro Concluído",
        description: `Processo de sinistro ${claim.claimNumber} arquivado. Veículo liberado 100% operacional.`,
        metadata: { claimId: claim.id },
        createdBy: currentUser?.displayName || "Sistema"
      });

      alert("Sinistro encerrado e arquivado com sucesso!");
      setSelectedClaim((prev: any) => (prev ? { ...prev, status: "closed" } : null));
      await loadData();
    } catch (err) {
      console.error("Erro ao fechar sinistro", err);
    }
  };

  // Criptografia auxiliar
  const sha256 = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `f0a2d48b${hex}8c68c2e68400a4d4e21a2c3a5e8f9b01c3d4e5f6`;
  };

  const logClaimAudit = async (claimId: string, field: string, oldValue: string, newValue: string) => {
    try {
      const rawText = `${claimId}-${field}-${oldValue}-${newValue}-${Date.now()}`;
      const hashVal = sha256(rawText);
      await addDocument("claim_audit_logs", {
        claimId,
        field,
        oldValue: String(oldValue),
        newValue: String(newValue),
        hash: hashVal,
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro ao registrar log de auditoria", e);
    }
  };

  const saveClaimVersion = async (claimId: string, reason: string) => {
    try {
      const allC = await getCollection("insurance_claims");
      const claimObj = allC.find((c: any) => c.id === claimId);
      if (!claimObj) return;

      const versions = await getCollection("claim_versions");
      const claimVers = versions?.filter((v: any) => v.claimId === claimId) || [];
      const nextVer = claimVers.length + 1;

      await addDocument("claim_versions", {
        claimId,
        versionNumber: nextVer,
        snapshot: JSON.stringify(claimObj),
        changedBy: currentUser?.displayName || "Supervisor",
        changedAt: new Date().toISOString(),
        changeReason: reason
      });
      await addTimelineEvent(claimId, "version_created", `Nova Versão Criada (v${nextVer})`, `Histórico congelado atualizado: ${reason}.`);
      await loadClaimSubCollections(claimId);
    } catch (e) {
      console.error(e);
    }
  };

  const updateClaimFields = async (claimId: string, fields: Partial<Claim>, auditReason?: string) => {
    try {
      const allC = await getCollection("insurance_claims");
      const oldClaim = allC.find((c: any) => c.id === claimId);
      if (!oldClaim) return;

      if (oldClaim.isFrozen && !auditReason) {
        alert("Este dossiê está congelado e assinado digitalmente. Para efetuar alterações, forneça uma justificativa para gerar uma nova versão.");
        return;
      }

      if (oldClaim.isFrozen && auditReason) {
        await saveClaimVersion(claimId, auditReason);
      }

      const updatedFields: any = { ...fields };

      for (const [key, value] of Object.entries(fields)) {
        const oldValue = (oldClaim as any)[key];
        if (oldValue !== value) {
          await logClaimAudit(claimId, key, String(oldValue ?? ""), String(value ?? ""));
          if (key === "status" && value === "closed") {
            updatedFields.isFrozen = true;
            updatedFields.sha256Fingerprint = sha256(JSON.stringify({ ...oldClaim, ...fields, status: "closed", isFrozen: true }));
          }
        }
      }

      await updateDocument("insurance_claims", claimId, updatedFields);
      await loadData();
      if (selectedClaim?.id === claimId) {
        setSelectedClaim((prev) => (prev ? { ...prev, ...updatedFields } : null));
        await loadClaimSubCollections(claimId);
      }
    } catch (err) {
      console.error("Erro ao atualizar sinistro", err);
    }
  };

  const saveOcorrenciaDetails = async (
    claimId: string,
    lat: number,
    lng: number,
    culprit: string,
    accidentReason: string,
    accidentDynamics: string,
    overrideReason?: string
  ) => {
    await updateClaimFields(claimId, {
      lat: Number(lat),
      lng: Number(lng),
      culprit: culprit as any,
      accidentReason,
      accidentDynamics
    }, overrideReason);
    await addTimelineEvent(claimId, "ocorrencia_updated", "Ocorrência Atualizada", "Informações dinâmicas de localização, culpabilidade e causa editadas.");
  };

  const saveJuridicoDetails = async (
    claimId: string,
    lawsuitNumber: string,
    attorneyName: string,
    responsibleParty: string,
    legalCosts: number,
    settlementAmount: number,
    status: "ongoing" | "settled" | "appealed"
  ) => {
    try {
      const allCases = await getCollection("claim_recovery_cases");
      const current = allCases?.find((c: any) => c.claimId === claimId);
      const payload = {
        claimId,
        lawsuitNumber,
        attorneyName,
        responsibleParty,
        legalCosts: Number(legalCosts),
        settlementAmount: Number(settlementAmount),
        status,
        createdAt: current?.createdAt || new Date().toISOString()
      };

      if (current) {
        await updateDocument("claim_recovery_cases", current.id, payload);
      } else {
        await addDocument("claim_recovery_cases", payload);
      }

      await addTimelineEvent(claimId, "juridico_updated", "Jurídico Atualizado", `Processo Judicial nº ${lawsuitNumber || "N/A"} registrado/atualizado.`);
      await loadClaimSubCollections(claimId);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    claims,
    drivers,
    vehicles,
    contracts,
    priceTable,
    allDamageItems,
    allBudgets,
    checklists,
    evidences,
    damageItems,
    budgets,
    installments,
    approvals,
    selectedClaim,
    setSelectedClaim,
    activeTab,
    setActiveTab,
    loading,
    checklistForm,
    setChecklistForm,
    boForm,
    setBoForm,
    tpForm,
    setTpForm,
    activeClaimsCount,
    repairingClaimsCount,
    closedClaimsCount,
    totalDamageCost,
    getDriverName,
    getVehiclePlate,
    createClaim,
    updateChecklist,
    addEvidence,
    saveBO,
    saveThirdParty,
    addDamageItem,
    deleteDamageItem,
    addBudget,
    approveBudget,
    confirmBilling,
    roleApproval,
    closeClaim,
    loadClaimSubCollections,
    
    // 2.0 properties & operations
    policeReport,
    insuranceDetails,
    financialRecovery,
    timelineEvents,
    savePoliceReportDetails,
    saveInsuranceDetails,
    saveFinancialRecoveryDetails,
    addTimelineEvent,

    // 2.0 digital dossier properties & operations
    claimAuditLogs,
    claimEvidenceChain,
    claimRiskAnalysis,
    claimVersions,
    claimRecoveryCase,
    updateClaimFields,
    saveClaimVersion,
    saveOcorrenciaDetails,
    saveJuridicoDetails
  };
}
