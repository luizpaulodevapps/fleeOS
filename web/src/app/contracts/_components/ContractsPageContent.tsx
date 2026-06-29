"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  normalizeContractStatus,
  createDefaultChecklistItems,
  createDefaultNewContractForm,
  createDefaultReceiptForm,
  createDefaultPromissoryForm,
  createDefaultAddendumForm,
} from "../_lib/utils";
import {
  getDriver,
  getVehicle,
  getDriverName,
  getVehicleInfo,
  getDriverLocks,
  getInterpolatedBody,
} from "../_lib/helpers";
import type {
  ContractStatus,
  ContractType,
  PaymentMethod,
  PromissoryStatus,
} from "../_lib/types";
import { ReceiptPrintView } from "./print/ReceiptPrintView";
import { ChecklistPrintView } from "./print/ChecklistPrintView";
import { ContractsListSection } from "./ContractsListSection";
import { NewContractModal } from "./modals/NewContractModal";
import { EditContractModal } from "./modals/EditContractModal";
import { SuspendContractModal } from "./modals/SuspendContractModal";
import { CloseContractModal } from "./modals/CloseContractModal";
import { ContractDetailModal } from "./modals/ContractDetailModal";
import { formatBillingRuleLabel } from "@/lib/billingEngine";

export function ContractsPageContent() {
  const { currentUser, getCollection, addDocument, updateDocument, deleteDocument, getNextSequence, can } = useAuth();

  // Collections
  const [contracts, setContracts]         = useState<any[]>([]);
  const [drivers, setDrivers]             = useState<any[]>([]);
  const [vehicles, setVehicles]           = useState<any[]>([]);
  const [templates, setTemplates]         = useState<any[]>([]);
  const [assignments, setAssignments]     = useState<any[]>([]);
  const [profiles, setProfiles]           = useState<any[]>([]);
  const [billingRules, setBillingRules]   = useState<any[]>([]);
  const [receipts, setReceipts]           = useState<any[]>([]);
  const [promissories, setPromissories]   = useState<any[]>([]);
  const [checklists, setChecklists]       = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [addendums, setAddendums]         = useState<any[]>([]);
  const [timeline, setTimeline]           = useState<any[]>([]);
  const [expirationAlerts, setExpirationAlerts] = useState<any[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<any[]>([]);

  // UI State
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("Todos");
  const [filterType, setFilterType]       = useState("Todos");
  const [loading, setLoading]             = useState(true);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen]   = useState(false);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");
  const [closingContract, setClosingContract] = useState<any | null>(null);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [suspendModal, setSuspendModal]       = useState<any | null>(null);

  const [editForm, setEditForm] = useState({
    status: "Ativo" as ContractStatus,
    type: "Locação" as ContractType,
    startDate: "",
    endDate: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    notes: "",
  });

  // New Contract Form
  const [formData, setFormData] = useState(createDefaultNewContractForm());

  // Receipt Form
  const [receiptForm, setReceiptForm] = useState(createDefaultReceiptForm());

  // Promissory Form
  const [promissoryForm, setPromissoryForm] = useState(createDefaultPromissoryForm());

  // Checklist Form
  const [checklistType, setChecklistType] = useState<"Entrega" | "Devolução">("Entrega");
  const [checklistMileage, setChecklistMileage] = useState("");
  const [checklistFuel, setChecklistFuel] = useState("1/2");
  const [checklistItems, setChecklistItems] = useState<{ label: string; checked: boolean; obs: string }[]>(
    createDefaultChecklistItems()
  );
  const [checklistObs, setChecklistObs] = useState("");
  const [printingReceipt, setPrintingReceipt] = useState<any | null>(null);
  const [printingChecklist, setPrintingChecklist] = useState<any | null>(null);

  // Addendum Form
  const [addendumForm, setAddendumForm] = useState(createDefaultAddendumForm());

  // Suspend Form
  const [suspendReason, setSuspendReason] = useState("");

  // Close Form
  const [closeForm, setCloseForm] = useState({ amountPaid: 0, notes: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [conList, drvList, vehList, tplList, asgList, profList, brList, recList, promList, chkList, addList, tlList, expList, settingsList, genDocsList] =
        await Promise.all([
          getCollection("contracts"),
          getCollection("drivers"),
          getCollection("vehicles"),
          getCollection("contract_templates"),
          getCollection("vehicle_assignments"),
          getCollection("daily_rate_profiles"),
          getCollection("billing_rules"),
          getCollection("contract_receipts"),
          getCollection("contract_promissories"),
          getCollection("contract_checklists"),
          getCollection("contract_addendums"),
          getCollection("activity_timeline"),
          getCollection("expirations"),
          getCollection("settings"),
          getCollection("generated_documents"),
        ]);
      const normalizedContracts = conList.map(contract => ({
        ...contract,
        status: normalizeContractStatus(contract.status),
      }));
      setContracts(normalizedContracts);
      setDrivers(drvList);
      setVehicles(vehList);
      setTemplates(tplList);
      setAssignments(asgList);
      setProfiles(profList || []);
      setBillingRules(brList || []);
      setReceipts(recList);
      setPromissories(promList);
      setChecklists(chkList);
      setAddendums(addList);
      setTimeline(tlList);
      setExpirationAlerts(expList);
      setCompanySettings(settingsList?.[0] || null);
      setGeneratedDocuments(genDocsList || []);
      setSelectedContract((current: any | null) => current
        ? normalizedContracts.find(contract => contract.id === current.id) || null
        : null
      );
    } catch (e) {
      console.error("Erro ao carregar contratos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Helpers ───
  
  
  
  
  

  

  // ─── Derived data ───
  const availableVehicles = vehicles.filter(v =>
    v.status === "active" && !contracts.some(c => c.status === "Ativo" && c.vehicleId === v.id)
  );

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchSearch =
        getDriverName(drivers, c.driverId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getVehicleInfo(vehicles, c.vehicleId).toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
      const matchType   = filterType   === "Todos" || c.type   === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [contracts, searchTerm, filterStatus, filterType, drivers, vehicles]);

  const metrics = useMemo(() => {
    const active   = contracts.filter(c => c.status === "Ativo").length;
    const suspended = contracts.filter(c => c.status === "Suspenso").length;
    const revenue  = contracts.filter(c => c.status === "Ativo").reduce((a, c) => a + (c.monthlyRate || 0), 0);
    const pendingProm = promissories.filter(p => p.status === "Pendente").length;
    const expiring = contracts.filter(c => {
      if (!c.endDate || c.status !== "Ativo") return false;
      const days = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
      return days >= 0 && days <= 30;
    }).length;
    return { active, suspended, revenue, pendingProm, expiring };
  }, [contracts, promissories]);

  // ─── Action Handlers ───
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverId || !formData.vehicleId) return;
    const locks = getDriverLocks(drivers, formData.driverId);
    if (locks.includes("Documentação")) { alert("⚠️ Assinatura bloqueada: Documentação irregular."); return; }
    if (locks.includes("CNH Suspensa"))  { alert("⚠️ Assinatura bloqueada: CNH Suspensa."); return; }
    if (locks.includes("Financeiro") || locks.includes("Conduta")) { alert("⚠️ Assinatura bloqueada: Restrições financeiras/disciplinares."); return; }
    if (!formData.signatureToken) { alert("⚠️ Insira o token de assinatura digital."); return; }

    try {
      const selectedProfile = profiles.find(p => p.id === formData.dailyProfileId);
      const selectedRule = billingRules.find(r => r.id === formData.billingRuleId);
      const payload = {
        driverId: formData.driverId, vehicleId: formData.vehicleId,
        startDate: formData.startDate, endDate: formData.endDate,
        dailyRate: Number(formData.dailyRate),
        weeklyRate: Number(formData.dailyRate) * 7 * 0.9,
        monthlyRate: Number(formData.dailyRate) * 30 * 0.85,
        status: "Ativo" as ContractStatus, type: formData.type,
        amountPaid: 0, closedBy: "",
        signatureToken: formData.signatureToken,
        dailyProfileId: formData.dailyProfileId || "",
        dailyAmountSnapshot: Number(formData.dailyRate),
        dailyProfileNameSnapshot: selectedProfile?.name || "Personalizado",
        billingRuleId: formData.billingRuleId || "",
        billingRuleNameSnapshot: selectedRule ? formatBillingRuleLabel(selectedRule) : "Padrão (Seg–Sex • Isenta feriados)",
        billingRuleSnapshot: selectedRule
          ? {
              weekdays: selectedRule.weekdays,
              exemptHolidays: !!selectedRule.exemptHolidays,
              exemptOptionalDays: !!selectedRule.exemptOptionalDays,
            }
          : null,
        notes: formData.notes,
        createdBy: currentUser?.displayName || "Operador",
      };

      const newContract = await addDocument("contracts", payload);
      await updateDocument("vehicles", formData.vehicleId, { status: "locado" });
      await addDocument("vehicle_assignments", {
        driverId: formData.driverId, vehicleId: formData.vehicleId,
        contractId: newContract.id, startDate: formData.startDate + "T08:00:00Z",
        endDate: null, active: true, status: "active"
      });
      await addDocument("activity_timeline", {
        entityType: "contract", entityId: newContract.id,
        eventType: "contract_created", title: "Contrato Assinado",
        description: `Contrato de ${formData.type} assinado digitalmente. Motorista: ${getDriverName(drivers, formData.driverId)} | Veículo: ${getVehicleInfo(vehicles, formData.vehicleId)}`,
        createdBy: currentUser?.displayName || "Operador"
      });

      setIsNewModalOpen(false);
      resetNewForm();
      loadData();
      alert("Contrato assinado e veículo atribuído com sucesso!");
    } catch (err) { console.error(err); }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModal || !suspendReason) return;
    await updateDocument("contracts", suspendModal.id, { status: "Suspenso", suspendReason, suspendedBy: currentUser?.displayName });
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: suspendModal.id,
      eventType: "suspended", title: "Contrato Suspenso",
      description: `Motivo: ${suspendReason}`, createdBy: currentUser?.displayName
    });
    setSuspendModal(null); setSuspendReason(""); loadData();
  };

  const handleReactivate = async (contract: any) => {
    if (!confirm("Reativar este contrato?")) return;
    await updateDocument("contracts", contract.id, { status: "Ativo", suspendReason: "" });
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: contract.id,
      eventType: "reactivated", title: "Contrato Reativado",
      description: "Contrato reativado pelo operador.", createdBy: currentUser?.displayName
    });
    loadData();
  };

  const handleRescind = async (contract: any) => {
    const reason = prompt("Motivo da Rescisão:");
    if (!reason) return;
    await updateDocument("contracts", contract.id, { status: "Rescindido", rescindReason: reason, closedBy: currentUser?.displayName });
    await updateDocument("vehicles", contract.vehicleId, { status: "active" });
    const activeAsgs = assignments.filter(a => a.contractId === contract.id && a.active);
    for (const asg of activeAsgs) await updateDocument("vehicle_assignments", asg.id, { active: false, endDate: new Date().toISOString(), status: "rescinded" });
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: contract.id,
      eventType: "rescinded", title: "Contrato Rescindido",
      description: `Motivo: ${reason}`, createdBy: currentUser?.displayName
    });
    loadData();
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingContract) return;
    await updateDocument("contracts", closingContract.id, {
      status: "Encerrado", endDate: new Date().toISOString().split("T")[0],
      closedBy: currentUser?.displayName, amountPaid: Number(closeForm.amountPaid), closeNotes: closeForm.notes
    });
    await updateDocument("vehicles", closingContract.vehicleId, { status: "active" });
    const activeAsgs = assignments.filter(a => a.contractId === closingContract.id && a.active);
    for (const asg of activeAsgs) await updateDocument("vehicle_assignments", asg.id, { active: false, endDate: new Date().toISOString(), status: "completed" });
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: closingContract.id,
      eventType: "closed", title: "Contrato Encerrado",
      description: `Total pago: R$ ${closeForm.amountPaid}. ${closeForm.notes}`, createdBy: currentUser?.displayName
    });
    setClosingContract(null); setCloseForm({ amountPaid: 0, notes: "" }); loadData();
  };

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    if (!receiptForm.date || Number(receiptForm.amount) <= 0) {
      alert("Informe uma data e um valor válido para o recibo.");
      return;
    }
    const receiptYear = new Date(`${receiptForm.date}T12:00:00`).getFullYear();
    const existingMaximum = receipts.reduce((maximum, receipt) => {
      const match = String(receipt.receiptNumber || "").match(new RegExp(`^REC-${receiptYear}-(\\d+)$`));
      return match ? Math.max(maximum, Number(match[1])) : maximum;
    }, 0);
    const sequence = await getNextSequence(`contract_receipts_${receiptYear}`, existingMaximum);
    const receiptNumber = `REC-${receiptYear}-${String(sequence).padStart(3, "0")}`;
    const payload = {
      contractId: selectedContract.id,
      driverId: selectedContract.driverId,
      vehicleId: selectedContract.vehicleId,
      receiptNumber,
      date: receiptForm.date,
      amount: Number(receiptForm.amount),
      period: receiptForm.period,
      type: receiptForm.type,
      paymentMethod: receiptForm.paymentMethod,
      notes: receiptForm.notes,
      issuedBy: currentUser?.displayName || "Operador",
      status: "Emitido"
    };
    await addDocument("contract_receipts", payload);
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: selectedContract.id,
      eventType: "receipt_issued", title: `Recibo Emitido: ${receiptNumber}`,
      description: `Valor: R$ ${receiptForm.amount} | ${receiptForm.paymentMethod} | Período: ${receiptForm.period}`,
      createdBy: currentUser?.displayName
    });
    setReceiptForm(createDefaultReceiptForm());
    loadData();
  };

  const handleCancelReceipt = async (receipt: any) => {
    if (receipt.status === "Cancelado" || !confirm(`Cancelar o recibo ${receipt.receiptNumber}?`)) return;
    await updateDocument("contract_receipts", receipt.id, {
      status: "Cancelado",
      canceledAt: new Date().toISOString(),
      canceledBy: currentUser?.displayName || "Operador",
    });
    await addDocument("activity_timeline", {
      entityType: "contract",
      entityId: receipt.contractId,
      eventType: "receipt_canceled",
      title: `Recibo Cancelado: ${receipt.receiptNumber}`,
      description: `Recibo no valor de R$ ${Number(receipt.amount).toFixed(2)} cancelado.`,
      createdBy: currentUser?.displayName || "Operador",
    });
    loadData();
  };

  const handleAddPromissory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    if (!promissoryForm.promissoryNumber.trim() || !promissoryForm.dueDate || Number(promissoryForm.amount) <= 0) {
      alert("Informe número, vencimento e valor válido para a promissória.");
      return;
    }
    const payload = {
      contractId: selectedContract.id,
      driverId: selectedContract.driverId,
      promissoryNumber: promissoryForm.promissoryNumber,
      dueDate: promissoryForm.dueDate,
      amount: Number(promissoryForm.amount),
      description: promissoryForm.description,
      checkNumber: promissoryForm.checkNumber,
      bankName: promissoryForm.bankName,
      status: promissoryForm.status,
      issuedAt: new Date().toISOString(),
      issuedBy: currentUser?.displayName || "Operador"
    };
    const newPromissory = await addDocument("contract_promissories", payload);

    // Auto-create expiration alert if status is Pendente
    if (promissoryForm.status === "Pendente" && promissoryForm.dueDate) {
      await addDocument("expirations", {
        type: "Promissória/Cheque",
        entityId: selectedContract.id,
        entityType: "contract",
        sourceId: newPromissory.id,
        driverId: selectedContract.driverId,
        label: `Promissória ${promissoryForm.promissoryNumber} — ${getDriverName(drivers, selectedContract.driverId)}`,
        expirationDate: promissoryForm.dueDate,
        amount: Number(promissoryForm.amount),
        notes: promissoryForm.description,
        status: "Pendente"
      });
    }

    await addDocument("activity_timeline", {
      entityType: "contract", entityId: selectedContract.id,
      eventType: "promissory_added", title: `Promissória ${promissoryForm.promissoryNumber} Registrada`,
      description: `Valor: R$ ${promissoryForm.amount} | Vencimento: ${promissoryForm.dueDate}`,
      createdBy: currentUser?.displayName
    });
    setPromissoryForm(createDefaultPromissoryForm());
    loadData();
  };

  const handlePromissoryStatus = async (promissory: any, status: PromissoryStatus) => {
    if (promissory.status === status) return;

    await updateDocument("contract_promissories", promissory.id, {
      status,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: currentUser?.displayName || "Operador",
    });

    const alert = expirationAlerts.find(item => item.sourceId === promissory.id);
    if (status === "Pendente") {
      if (alert) {
        await updateDocument("expirations", alert.id, { status: "Pendente", expirationDate: promissory.dueDate });
      } else {
        await addDocument("expirations", {
          type: "Promissória/Cheque",
          entityId: promissory.contractId,
          entityType: "contract",
          sourceId: promissory.id,
          driverId: promissory.driverId,
          label: `Promissória ${promissory.promissoryNumber} — ${getDriverName(drivers, promissory.driverId)}`,
          expirationDate: promissory.dueDate,
          amount: Number(promissory.amount),
          notes: promissory.description,
          status: "Pendente",
        });
      }
    } else if (alert) {
      await updateDocument("expirations", alert.id, {
        status: status === "Cancelado" ? "Cancelado" : "Concluído",
        resolvedAt: new Date().toISOString(),
      });
    }

    await addDocument("activity_timeline", {
      entityType: "contract",
      entityId: promissory.contractId,
      eventType: "promissory_status_changed",
      title: `Promissória ${promissory.promissoryNumber}: ${status}`,
      description: `Status alterado de ${promissory.status} para ${status}.`,
      createdBy: currentUser?.displayName || "Operador",
    });
    loadData();
  };

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    await addDocument("contract_checklists", {
      contractId: selectedContract.id,
      vehicleId: selectedContract.vehicleId,
      driverId: selectedContract.driverId,
      type: checklistType,
      mileageAtEvent: Number(checklistMileage),
      fuelLevel: checklistFuel,
      items: checklistItems.map(item => ({
        label: item.label,
        checked: item.checked,
        observation: item.obs,
      })),
      observations: checklistObs,
      signedAt: new Date().toISOString(),
      signedBy: currentUser?.displayName || "Operador"
    });
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: selectedContract.id,
      eventType: "checklist_done", title: `Checklist de ${checklistType} Registrado`,
      description: `KM: ${checklistMileage} | Combustível: ${checklistFuel}`,
      createdBy: currentUser?.displayName
    });
    setChecklistItems(createDefaultChecklistItems());
    setChecklistMileage(""); setChecklistObs("");
    loadData();
  };

  const handleAddAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    const payload = {
      contractId: selectedContract.id,
      type: addendumForm.type,
      description: addendumForm.description,
      newEndDate: addendumForm.newEndDate || null,
      newDailyRate: addendumForm.newDailyRate ? Number(addendumForm.newDailyRate) : null,
      signatureToken: addendumForm.signatureToken,
      issuedAt: new Date().toISOString(),
      issuedBy: currentUser?.displayName || "Operador"
    };
    await addDocument("contract_addendums", payload);
    if (addendumForm.newEndDate) await updateDocument("contracts", selectedContract.id, { endDate: addendumForm.newEndDate });
    if (addendumForm.newDailyRate) {
      const newDailyRate = Number(addendumForm.newDailyRate);
      await updateDocument("contracts", selectedContract.id, {
        dailyRate: newDailyRate,
        weeklyRate: newDailyRate * 7 * 0.9,
        monthlyRate: newDailyRate * 30 * 0.85,
      });
    }
    await addDocument("activity_timeline", {
      entityType: "contract", entityId: selectedContract.id,
      eventType: "addendum", title: `Aditivo: ${addendumForm.type}`,
      description: addendumForm.description, createdBy: currentUser?.displayName
    });
    setAddendumForm(createDefaultAddendumForm());
    loadData();
  };

  // ─── Document Generation Handlers ──────────────────────────────────────
  const handleGenerateDocument = async (templateId: string) => {
    if (!selectedContract) return;
    const template = [...templates, ...generatedDocuments].find(t => t.id === templateId) ||
                     (await import("@/app/documents/_lib/templates")).DOCUMENT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const driver = drivers.find(d => d.id === selectedContract.driverId);
    const vehicle = vehicles.find(v => v.id === selectedContract.vehicleId);
    const { buildVariableMap, resolveVariables } = await import("@/app/documents/_lib/engine");
    const vars = buildVariableMap(selectedContract, driver, vehicle, companySettings, {});
    const resolvedBody = resolveVariables(template.body, vars);

    await addDocument("generated_documents", {
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      resolvedBody,
      contractId: selectedContract.id,
      driverId: selectedContract.driverId,
      vehicleId: selectedContract.vehicleId,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.displayName || "Sistema",
      tenantId: currentUser?.tenantId || "default",
    });

    await addDocument("activity_timeline", {
      entityType: "contract", entityId: selectedContract.id,
      eventType: "document", title: `Documento gerado: ${template.name}`,
      description: `Template: ${template.name}`, createdBy: currentUser?.displayName,
    });

    loadData();
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Excluir este documento gerado?")) return;
    await deleteDocument("generated_documents", docId);
    loadData();
  };

  const [viewingDocument, setViewingDocument] = useState<any | null>(null);

  const handleViewDocument = (doc: any) => {
    setViewingDocument(doc);
  };

  const resetNewForm = () => setFormData(createDefaultNewContractForm());

  const openContractDetail = (contract: any) => {
    setSelectedContract(contract);
    setActiveDetailTab("overview");
  };

  const openEditContract = (contract: any) => {
    setEditingContract(contract);
    setEditForm({
      status: normalizeContractStatus(contract.status),
      type: contract.type || "Locação",
      startDate: contract.startDate || "",
      endDate: contract.endDate || "",
      dailyRate: String(contract.dailyRate ?? ""),
      weeklyRate: String(contract.weeklyRate ?? ""),
      monthlyRate: String(contract.monthlyRate ?? ""),
      notes: contract.notes || "",
    });
  };

  const handleEditContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    const previousStatus = normalizeContractStatus(editingContract.status);
    const payload = {
      status: editForm.status,
      type: editForm.type,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      dailyRate: Number(editForm.dailyRate),
      weeklyRate: Number(editForm.weeklyRate),
      monthlyRate: Number(editForm.monthlyRate),
      notes: editForm.notes,
      updatedBy: currentUser?.displayName || "Operador",
      updatedAt: new Date().toISOString(),
    };

    await updateDocument("contracts", editingContract.id, payload);

    if (["Encerrado", "Rescindido"].includes(editForm.status) && !["Encerrado", "Rescindido"].includes(previousStatus)) {
      await updateDocument("vehicles", editingContract.vehicleId, { status: "active" });
      const activeAssignments = assignments.filter(assignment => assignment.contractId === editingContract.id && assignment.active);
      for (const assignment of activeAssignments) {
        await updateDocument("vehicle_assignments", assignment.id, {
          active: false,
          endDate: new Date().toISOString(),
          status: editForm.status === "Rescindido" ? "rescinded" : "completed",
        });
      }
    } else if (editForm.status === "Ativo") {
      await updateDocument("vehicles", editingContract.vehicleId, { status: "locado" });
    }

    await addDocument("activity_timeline", {
      entityType: "contract",
      entityId: editingContract.id,
      eventType: "contract_updated",
      title: "Contrato Editado",
      description: `Status: ${previousStatus} → ${editForm.status}. Vigência e valores contratuais revisados.`,
      createdBy: currentUser?.displayName || "Operador",
    });

    setEditingContract(null);
    loadData();
  };

  if (printingReceipt) {
    const contract = contracts.find((c) => c.id === printingReceipt.contractId);
    return (
      <ReceiptPrintView
        printingReceipt={printingReceipt}
        driver={getDriver(drivers, printingReceipt.driverId)}
        vehicle={getVehicle(vehicles, contract?.vehicleId)}
        onBack={() => setPrintingReceipt(null)}
      />
    );
  }

  if (printingChecklist) {
    return (
      <ChecklistPrintView
        printingChecklist={printingChecklist}
        driver={getDriver(drivers, printingChecklist.driverId)}
        vehicle={getVehicle(vehicles, printingChecklist.vehicleId)}
        onBack={() => setPrintingChecklist(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ContractsListSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        filteredContracts={filteredContracts}
        loading={loading}
        metrics={metrics}
        receipts={receipts}
        promissories={promissories}
        checklists={checklists}
        drivers={drivers}
        vehicles={vehicles}
        can={can}
        onOpenDetail={openContractDetail}
        onEdit={openEditContract}
        onSuspend={setSuspendModal}
        onClose={(contract) => { setClosingContract(contract); setCloseForm({ amountPaid: 0, notes: "" }); }}
        onReactivate={handleReactivate}
        onRescind={handleRescind}
        onNewContract={() => { resetNewForm(); setIsNewModalOpen(true); }}
      />

      {isNewModalOpen && (
        <NewContractModal
          formData={formData}
          setFormData={setFormData}
          drivers={drivers}
          vehicles={availableVehicles}
          templates={templates}
          profiles={profiles}
          billingRules={billingRules}
          onClose={() => setIsNewModalOpen(false)}
          onSubmit={handleCreate}
          getDriverLocks={(id) => getDriverLocks(drivers, id)}
          getInterpolatedBody={(templateId, driverId, vehicleId, dailyRate) =>
            getInterpolatedBody(templates, drivers, vehicles, templateId, driverId, vehicleId, dailyRate, companySettings)
          }
        />
      )}

      {editingContract && (
        <EditContractModal
          editingContract={editingContract}
          editForm={editForm}
          setEditForm={setEditForm}
          driverName={getDriverName(drivers, editingContract.driverId)}
          onClose={() => setEditingContract(null)}
          onSubmit={handleEditContract}
        />
      )}

      {suspendModal && (
        <SuspendContractModal
          contract={suspendModal}
          driverName={getDriverName(drivers, suspendModal.driverId)}
          suspendReason={suspendReason}
          setSuspendReason={setSuspendReason}
          onClose={() => { setSuspendModal(null); setSuspendReason(""); }}
          onSubmit={handleSuspend}
        />
      )}

      {closingContract && (
        <CloseContractModal
          contract={closingContract}
          driverName={getDriverName(drivers, closingContract.driverId)}
          vehicleInfo={getVehicleInfo(vehicles, closingContract.vehicleId)}
          closeForm={closeForm}
          setCloseForm={setCloseForm}
          onClose={() => setClosingContract(null)}
          onSubmit={handleClose}
        />
      )}

      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          drivers={drivers}
          vehicles={vehicles}
          company={companySettings}
          receipts={receipts}
          promissories={promissories}
          checklists={checklists}
          addendums={addendums}
          timeline={timeline}
          generatedDocuments={generatedDocuments}
          activeDetailTab={activeDetailTab}
          setActiveDetailTab={setActiveDetailTab}
          can={can}
          onClose={() => setSelectedContract(null)}
          onEdit={openEditContract}
          onGenerateDocument={handleGenerateDocument}
          onDeleteDocument={handleDeleteDocument}
          onViewDocument={handleViewDocument}
          receiptForm={receiptForm}
          setReceiptForm={setReceiptForm}
          promissoryForm={promissoryForm}
          setPromissoryForm={setPromissoryForm}
          checklistType={checklistType}
          setChecklistType={setChecklistType}
          checklistMileage={checklistMileage}
          setChecklistMileage={setChecklistMileage}
          checklistFuel={checklistFuel}
          setChecklistFuel={setChecklistFuel}
          checklistItems={checklistItems}
          setChecklistItems={setChecklistItems}
          checklistObs={checklistObs}
          setChecklistObs={setChecklistObs}
          addendumForm={addendumForm}
          setAddendumForm={setAddendumForm}
          onPrintReceipt={setPrintingReceipt}
          onCancelReceipt={handleCancelReceipt}
          onAddReceipt={handleAddReceipt}
          onPromissoryStatus={handlePromissoryStatus}
          onAddPromissory={handleAddPromissory}
          onPrintChecklist={setPrintingChecklist}
          onSubmitChecklist={handleSubmitChecklist}
          onAddAddendum={handleAddAddendum}
          currentUserName={currentUser?.displayName || "Sistema"}
        />
      )}
    </div>
  );
}
