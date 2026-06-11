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
  ClaimApproval
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

  // Selection states
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState("details");

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
    insurer: ""
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
      const [chkList, evList, repList, tpList, dmgList, bdgList, instList, appList] = await Promise.all([
        getCollection("claim_checklists"),
        getCollection("claim_evidences"),
        getCollection("claim_reports"),
        getCollection("claim_third_parties"),
        getCollection("claim_damage_items"),
        getCollection("claim_budgets"),
        getCollection("claim_installments"),
        getCollection("claim_approvals")
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
          insurer: claimTp.insurer || ""
        });
      } else {
        setTpForm({ name: "", cpf: "", phone: "", plate: "", vehicle: "", insurer: "" });
      }

      setDamageItems(dmgList?.filter((d: any) => d.claimId === claimId) || []);
      setBudgets(bdgList?.filter((b: any) => b.claimId === claimId) || []);
      setInstallments(instList?.filter((i: any) => i.claimId === claimId) || []);
      setApprovals(appList?.filter((a: any) => a.claimId === claimId) || []);
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
        createdBy: currentUser?.displayName || "Sistema",
        createdAt: new Date().toISOString()
      };

      const newClaim = await addDocument("insurance_claims", payload);

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

      await updateDocument("insurance_claims", claim.id, {
        status: "awaiting_approval"
      });

      await addDocument("activity_timeline", {
        entityType: "driver",
        entityId: claim.driverId,
        eventType: "claim_budget_approved",
        title: "Orçamento Oficina Aprovado",
        description: `Orçamento da oficina ${selectedBdg?.workshopName} no valor de R$ ${selectedBdg?.amount} foi selecionado e aprovado.`,
        metadata: { claimId: claim.id, budgetId },
        createdBy: currentUser?.displayName || "Sistema"
      });

      alert("Orçamento de funilaria aprovado!");
      setSelectedClaim((prev: any) => (prev ? { ...prev, status: "awaiting_approval" } : null));
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
      await updateDocument("insurance_claims", claim.id, {
        status: "closed"
      });

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
    loadClaimSubCollections
  };
}
