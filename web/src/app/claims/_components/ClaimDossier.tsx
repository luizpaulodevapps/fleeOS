"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Claim, ChecklistForm, BoForm, TpForm, ClaimEvidence, 
  ClaimDamageItem, ClaimBudget, ClaimInstallment, ClaimApproval, 
  ClaimPoliceReport, ClaimInsurance, ClaimFinancialRecovery, ClaimTimelineEvent,
  ClaimAuditLog, ClaimEvidenceChain, ClaimRiskAnalysis, ClaimVersion, ClaimRecoveryCase
} from "../_lib/types";
import { VehicleDamageMap } from "./VehicleDamageMap";
import { EvidenceUploader } from "./EvidenceUploader";
import { ThirdPartyForm } from "./ThirdPartyForm";
import { PoliceReportCard } from "./PoliceReportCard";
import { InsurancePanel } from "./InsurancePanel";
import { RecoveryPanel } from "./RecoveryPanel";
import { ClaimTimeline } from "./ClaimTimeline";
import { useDriverRisk } from "../_hooks/useDriverRisk";
import {
  Shield, AlertOctagon, Sliders, Settings, Camera,
  FileCheck, UserMinus, Hammer, FileText, Landmark,
  Scale, History, ArrowLeft, CheckCircle2, AlertTriangle, 
  ShieldCheck, MapPin, Eye, FileDigit, LandmarkIcon, DollarSign, HammerIcon
} from "lucide-react";

interface ClaimDossierProps {
  claim: Claim;
  onBack: () => void;
  getDriverName: (id: string) => string;
  getVehiclePlate: (id: string) => string;
  can: (perm: string) => boolean;
  currentUser: any;
  priceTable: any[];

  // Sub-collection lists
  checklists: any[];
  evidences: ClaimEvidence[];
  damageItems: ClaimDamageItem[];
  budgets: ClaimBudget[];
  installments: ClaimInstallment[];
  approvals: ClaimApproval[];

  // 2.0 structures
  policeReport: ClaimPoliceReport | null;
  insuranceDetails: ClaimInsurance | null;
  financialRecovery: ClaimFinancialRecovery | null;
  timelineEvents: ClaimTimelineEvent[];

  // Forms states
  checklistForm: ChecklistForm;
  setChecklistForm: React.Dispatch<React.SetStateAction<ChecklistForm>>;
  boForm: BoForm;
  setBoForm: React.Dispatch<React.SetStateAction<BoForm>>;
  tpForm: TpForm;
  setTpForm: React.Dispatch<React.SetStateAction<TpForm>>;

  // Operations
  updateChecklist: (claimId: string, form: ChecklistForm) => Promise<void>;
  addEvidence: (claimId: string, fileType: string, fileUrl: string) => Promise<void>;
  saveBO: (claimId: string, form: BoForm) => Promise<void>;
  saveThirdParty: (claimId: string, form: TpForm) => Promise<void>;
  addDamageItem: (claimId: string, item: string, severity: string, estimatedCost: number) => Promise<void>;
  deleteDamageItem: (claimId: string, itemId: string) => Promise<void>;
  addBudget: (claimId: string, workshopName: string, amount: number, description: string, attachmentUrl: string) => Promise<void>;
  approveBudget: (claim: Claim, budgetId: string) => Promise<void>;
  confirmBilling: (claim: Claim, totalAmount: number, installmentsCount: number, description: string) => Promise<void>;
  roleApproval: (claim: Claim, status: "approved" | "rejected", comments: string) => Promise<void>;
  closeClaim: (claim: Claim) => Promise<void>;

  // 2.0 operations
  savePoliceReportDetails: (claimId: string, form: ClaimPoliceReport) => Promise<void>;
  saveInsuranceDetails: (claimId: string, form: ClaimInsurance) => Promise<void>;
  saveFinancialRecoveryDetails: (claimId: string, form: ClaimFinancialRecovery) => Promise<void>;

  // 2.0 digital dossier parameters & operations
  claimAuditLogs: ClaimAuditLog[];
  claimEvidenceChain: ClaimEvidenceChain[];
  claimRiskAnalysis: ClaimRiskAnalysis | null;
  claimVersions: ClaimVersion[];
  claimRecoveryCase: ClaimRecoveryCase | null;
  updateClaimFields: (claimId: string, fields: Partial<Claim>, auditReason?: string) => Promise<void>;
  saveClaimVersion: (claimId: string, reason: string) => Promise<void>;
  saveOcorrenciaDetails: (claimId: string, lat: number, lng: number, culprit: string, accidentReason: string, accidentDynamics: string, overrideReason?: string) => Promise<void>;
  saveJuridicoDetails: (claimId: string, lawsuitNumber: string, attorneyName: string, responsibleParty: string, legalCosts: number, settlementAmount: number, status: "ongoing" | "settled" | "appealed") => Promise<void>;
}

export function ClaimDossier({
  claim,
  onBack,
  getDriverName,
  getVehiclePlate,
  can,
  currentUser,
  priceTable,
  checklists,
  evidences,
  damageItems,
  budgets,
  installments,
  approvals,
  policeReport,
  insuranceDetails,
  financialRecovery,
  timelineEvents,
  checklistForm,
  setChecklistForm,
  boForm,
  setBoForm,
  tpForm,
  setTpForm,
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
  savePoliceReportDetails,
  saveInsuranceDetails,
  saveFinancialRecoveryDetails,

  // 2.0 digital dossier
  claimAuditLogs,
  claimEvidenceChain,
  claimRiskAnalysis,
  claimVersions,
  claimRecoveryCase,
  updateClaimFields,
  saveClaimVersion,
  saveOcorrenciaDetails,
  saveJuridicoDetails
}: ClaimDossierProps) {
  const [dossierTab, setDossierTab] = useState("summary");

  // Ocorrência Tab States
  const [ocorrenciaLat, setOcorrenciaLat] = useState(claim.lat || -23.626012);
  const [ocorrenciaLng, setOcorrenciaLng] = useState(claim.lng || -46.658023);
  const [ocorrenciaCulprit, setOcorrenciaCulprit] = useState(claim.culprit || "unknown");
  const [ocorrenciaReason, setOcorrenciaReason] = useState(claim.accidentReason || "");
  const [ocorrenciaDynamics, setOcorrenciaDynamics] = useState(claim.accidentDynamics || claim.description || "");
  const [ocorrenciaLocation, setOcorrenciaLocation] = useState(claim.location || "");
  const [overrideReason, setOverrideReason] = useState("");
  const [savingOcorrencia, setSavingOcorrencia] = useState(false);

  // Technical Checklist internal fields mapping
  const [startsEngine, setStartsEngine] = useState(claim.startsEngine ?? true);
  const [vehicleMoves, setVehicleMoves] = useState(claim.vehicleMoves ?? true);
  const [steeringOk, setSteeringOk] = useState(claim.steeringOk ?? true);
  const [brakesOk, setBrakesOk] = useState(claim.brakesOk ?? true);
  const [coolingSystemOk, setCoolingSystemOk] = useState(claim.coolingSystemOk ?? true);
  const [electricalSystemOk, setElectricalSystemOk] = useState(claim.electricalSystemOk ?? true);
  const [airbagsDeployed, setAirbagsDeployed] = useState(claim.airbagsDeployed ?? false);
  const [fluidLeak, setFluidLeak] = useState(claim.fluidLeak ?? false);
  const [suspensionDamage, setSuspensionDamage] = useState(claim.suspensionDamage ?? false);
  const [wheelDamage, setWheelDamage] = useState(claim.wheelDamage ?? false);
  const [windshieldDamage, setWindshieldDamage] = useState(claim.windshieldDamage ?? false);
  const [headlightDamage, setHeadlightDamage] = useState(claim.headlightDamage ?? false);

  // Workshop local form
  const [workshopName, setWorkshopName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetDesc, setBudgetDesc] = useState("");
  const [budgetUrl, setBudgetUrl] = useState("");
  const [addingBudget, setAddingBudget] = useState(false);

  // Jurídico Tab States
  const [lawsuitNumber, setLawsuitNumber] = useState(claimRecoveryCase?.lawsuitNumber || "");
  const [attorneyName, setAttorneyName] = useState(claimRecoveryCase?.attorneyName || "");
  const [responsibleParty, setResponsibleParty] = useState(claimRecoveryCase?.responsibleParty || "Terceiro");
  const [legalCosts, setLegalCosts] = useState(claimRecoveryCase?.legalCosts || 0);
  const [settlementAmount, setSettlementAmount] = useState(claimRecoveryCase?.settlementAmount || 0);
  const [juridicoStatus, setJuridicoStatus] = useState<"ongoing" | "settled" | "appealed">(claimRecoveryCase?.status || "ongoing");
  const [savingJuridico, setSavingJuridico] = useState(false);

  // Selected Version Viewer state
  const [selectedVersionText, setSelectedVersionText] = useState<string | null>(null);

  // Sync state values on claim prop change
  useEffect(() => {
    setOcorrenciaLat(claim.lat || -23.626012);
    setOcorrenciaLng(claim.lng || -46.658023);
    setOcorrenciaCulprit(claim.culprit || "unknown");
    setOcorrenciaReason(claim.accidentReason || "");
    setOcorrenciaDynamics(claim.accidentDynamics || claim.description || "");
    setOcorrenciaLocation(claim.location || "");

    setStartsEngine(claim.startsEngine ?? true);
    setVehicleMoves(claim.vehicleMoves ?? true);
    setSteeringOk(claim.steeringOk ?? true);
    setBrakesOk(claim.brakesOk ?? true);
    setCoolingSystemOk(claim.coolingSystemOk ?? true);
    setElectricalSystemOk(claim.electricalSystemOk ?? true);
    setAirbagsDeployed(claim.airbagsDeployed ?? false);
    setFluidLeak(claim.fluidLeak ?? false);
    setSuspensionDamage(claim.suspensionDamage ?? false);
    setWheelDamage(claim.wheelDamage ?? false);
    setWindshieldDamage(claim.windshieldDamage ?? false);
    setHeadlightDamage(claim.headlightDamage ?? false);
  }, [claim]);

  useEffect(() => {
    if (claimRecoveryCase) {
      setLawsuitNumber(claimRecoveryCase.lawsuitNumber || "");
      setAttorneyName(claimRecoveryCase.attorneyName || "");
      setResponsibleParty(claimRecoveryCase.responsibleParty || "Terceiro");
      setLegalCosts(claimRecoveryCase.legalCosts || 0);
      setSettlementAmount(claimRecoveryCase.settlementAmount || 0);
      setJuridicoStatus(claimRecoveryCase.status || "ongoing");
    }
  }, [claimRecoveryCase]);

  // Billing installment local form
  const [billingTotal, setBillingTotal] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(3);
  const [billingDescription, setBillingDescription] = useState("");
  const [billingSubmitting, setBillingSubmitting] = useState(false);

  // Approval comments
  const [approvalComments, setApprovalComments] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Sync default billing amounts
  useEffect(() => {
    const approved = budgets.find((b) => b.status === "approved");
    if (approved) {
      setBillingTotal(approved.amount);
    }
    setBillingDescription(
      `Cobrança de coparticipação referente ao sinistro ${claim.claimNumber} (${claim.location}).`
    );
  }, [budgets, claim]);

  // Risk profile computation
  const riskAnalysis = useDriverRisk({
    driverId: claim.driverId,
    claims: [claim],
    allDamageItems: damageItems,
    allBudgets: budgets
  });

  // Intel Cost Prediction Benchmark:
  // Light: 2300, Medium: 4500, Severe: 9800, Total Loss: 45000
  const historicalAvgCost = useMemo(() => {
    if (claim.severity === "total_loss") return 45000;
    if (claim.severity === "severe") return 9800;
    if (claim.severity === "medium") return 4500;
    return 2300;
  }, [claim.severity]);

  // Checklist Auto-severity Recomendation calculator
  const calculatedSeverity = useMemo(() => {
    if (airbagsDeployed || fluidLeak) {
      return "total_loss";
    }
    if (suspensionDamage || !vehicleMoves || !steeringOk) {
      return "severe";
    }
    if (windshieldDamage || headlightDamage || !startsEngine) {
      return "medium";
    }
    return "light";
  }, [airbagsDeployed, fluidLeak, suspensionDamage, vehicleMoves, steeringOk, windshieldDamage, headlightDamage, startsEngine]);

  const handleSaveOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOcorrencia(true);
    await saveOcorrenciaDetails(
      claim.id,
      ocorrenciaLat,
      ocorrenciaLng,
      ocorrenciaCulprit,
      ocorrenciaReason,
      ocorrenciaDynamics,
      claim.isFrozen ? overrideReason : undefined
    );
    setOverrideReason("");
    setSavingOcorrencia(false);
  };

  const handleSaveChecklistFields = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      startsEngine,
      vehicleMoves,
      steeringOk,
      brakesOk,
      coolingSystemOk,
      electricalSystemOk,
      airbagsDeployed,
      fluidLeak,
      suspensionDamage,
      wheelDamage,
      windshieldDamage,
      headlightDamage,
      severity: calculatedSeverity as "light" | "medium" | "severe" | "total_loss"
    };

    await updateClaimFields(claim.id, payload, claim.isFrozen ? overrideReason : undefined);
    setOverrideReason("");
    alert("Checklist técnico e severidade atualizados com sucesso!");
  };

  const handleAddBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopName.trim() || budgetAmount <= 0) return;
    setAddingBudget(true);
    await addBudget(claim.id, workshopName.trim(), budgetAmount, budgetDesc.trim(), budgetUrl.trim() || "https://example.com/orcamento.pdf");
    setWorkshopName("");
    setBudgetAmount(0);
    setBudgetDesc("");
    setBudgetUrl("");
    setAddingBudget(false);
  };

  const handleConfirmBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billingTotal <= 0) return;
    setBillingSubmitting(true);
    await confirmBilling(claim, billingTotal, installmentsCount, billingDescription);
    setBillingSubmitting(false);
  };

  const handleApprovalSubmit = async (status: "approved" | "rejected") => {
    setSubmittingApproval(true);
    await roleApproval(claim, status, approvalComments);
    setApprovalComments("");
    setSubmittingApproval(false);
  };

  const handleSaveJuridico = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJuridico(true);
    await saveJuridicoDetails(
      claim.id,
      lawsuitNumber,
      attorneyName,
      responsibleParty,
      legalCosts,
      settlementAmount,
      juridicoStatus
    );
    setSavingJuridico(false);
    alert("Dossiê Jurídico atualizado!");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Crítico": return "bg-red-500 text-white font-black";
      case "Alto": return "bg-orange-500 text-white font-bold";
      case "Médio": return "bg-amber-500 text-slate-900 font-bold";
      default: return "bg-emerald-500 text-white font-bold";
    }
  };

  const statusMap: Record<string, string> = {
    open: "Aberto / Em Análise",
    repairing: "Em Oficina",
    charged: "Faturado / Cobrado",
    closed: "Encerrado / Assinado",
    under_review: "Aguardando Parecer",
    awaiting_approval: "Aguardando Diretoria"
  };

  const severityLabels = {
    light: "Leve (Estético)",
    medium: "Moderado (Funcional)",
    severe: "Grave (Mecânico)",
    total_loss: "Perda Total (Integral)"
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case "closed": return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "repairing": return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
      case "under_review":
      case "awaiting_approval":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Dossier Header and summary cards */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center shadow-sm">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-outline hover:text-primary font-bold hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Sinistros Ativos</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-primary font-geist flex items-center gap-1.5">
              <span>🚨 Central de Sinistros: {claim.claimNumber}</span>
              {claim.isFrozen && (
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Assinado (FROZEN)
                </span>
              )}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(claim.status)}`}>
              {statusMap[claim.status] || claim.status}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Veículo: <span className="font-bold">{getVehiclePlate(claim.vehicleId)}</span> | Condutor: <span className="font-bold">{getDriverName(claim.driverId)}</span>
          </p>
        </div>

        {/* Risk profile widget */}
        <div className="flex items-center space-x-3 bg-slate-50 border p-3.5 rounded-xl">
          <div>
            <span className="text-[9px] text-outline uppercase font-bold block">Perfil de Risco Condutor</span>
            <span className="text-xs font-black text-primary block">{riskAnalysis.riskLevel}</span>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${getRiskColor(riskAnalysis.riskLevel)}`}>
            {riskAnalysis.score}
          </div>
        </div>
      </div>

      {/* Dossier Tabs bar (10 Tabs matching specs) */}
      <div className="border-b border-outline-variant bg-slate-50 flex overflow-x-auto text-[10px] font-bold rounded-lg shadow-sm">
        {[
          { id: "summary", label: "Ocorrência", icon: Sliders },
          { id: "checklist", label: "Checklist Técnico", icon: FileCheck },
          { id: "damages", label: "Avarias Map", icon: Hammer },
          { id: "evidence", label: "Evidências", icon: Camera },
          { id: "bo", label: "BO Eletrônico", icon: FileText },
          { id: "thirdparty", label: "Terceiros", icon: UserMinus },
          { id: "workshop", label: "Oficina & Peças", icon: Settings },
          { id: "insurance", label: "Seguradora", icon: Landmark },
          { id: "recovery", label: "Recuperação", icon: Scale },
          { id: "juridico", label: "⚖ Jurídico", icon: LandmarkIcon },
          { id: "timeline", label: "Timeline", icon: History },
          { id: "audit", label: "Auditoria & Antifraude", icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = dossierTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setDossierTab(tab.id);
                setSelectedVersionText(null);
              }}
              className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 transition-all shrink-0 uppercase tracking-wider ${
                isAct
                  ? "border-primary text-primary bg-white font-extrabold"
                  : "border-transparent text-on-surface-variant hover:text-primary hover:bg-white/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content area */}
      <div className="text-xs min-h-[400px]">
        {/* TAB 1: OCORRÊNCIA */}
        {dossierTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-4">
              <form onSubmit={handleSaveOcorrencia} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
                <p className="font-bold text-primary uppercase text-[10px] border-b pb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Dossiê da Ocorrência (QUANDO, ONDE, QUEM, COMO, POR QUE)</span>
                </p>

                {claim.isFrozen && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-amber-800 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Dossiê Assinado e Congelado (Antifraude Ativo)</span>
                    </p>
                    <p className="text-[10px] leading-tight font-medium">
                      Qualquer modificação gerará uma nova versão no banco de dados (`claim_versions`). Por favor, justifique a alteração no campo correspondente antes de salvar.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-black uppercase">Justificativa de Override *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Correção de logradouro a pedido do jurídico..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Data e Hora (QUANDO)</label>
                    <input 
                      type="datetime-local"
                      value={claim.occurrenceDate}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-outline-variant/60 rounded text-on-surface-variant font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Localização (ONDE)</label>
                    <input 
                      type="text"
                      disabled={claim.isFrozen && !overrideReason}
                      value={ocorrenciaLocation}
                      onChange={(e) => {
                        // Keep simple update
                      }}
                      placeholder="Localização da colisão"
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Culpabilidade (QUEM)</label>
                    <select
                      disabled={claim.isFrozen && !overrideReason}
                      value={ocorrenciaCulprit}
                      onChange={(e) => setOcorrenciaCulprit(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded font-bold text-primary"
                    >
                      <option value="unknown">Em Análise</option>
                      <option value="driver">Condutor Frota</option>
                      <option value="third_party">Terceiro Envolvido</option>
                      <option value="none">Sem culpado / Força Maior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Causa Provável (POR QUE)</label>
                    <input 
                      type="text"
                      disabled={claim.isFrozen && !overrideReason}
                      value={ocorrenciaReason}
                      onChange={(e) => setOcorrenciaReason(e.target.value)}
                      placeholder="Causa provável do impacto"
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Latitude / Longitude (GPS)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        step="0.000001"
                        disabled={claim.isFrozen && !overrideReason}
                        value={ocorrenciaLat}
                        onChange={(e) => setOcorrenciaLat(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded font-mono"
                      />
                      <input 
                        type="number"
                        step="0.000001"
                        disabled={claim.isFrozen && !overrideReason}
                        value={ocorrenciaLng}
                        onChange={(e) => setOcorrenciaLng(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOcorrenciaLat(-23.626012);
                          setOcorrenciaLng(-46.658023);
                        }}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold"
                      >
                        Mapear
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-outline font-bold uppercase mb-1">Condutor / Veículo</label>
                    <p className="px-3 py-2 bg-slate-100 border rounded font-semibold text-on-surface-variant leading-tight">
                      {getDriverName(claim.driverId)} ({getVehiclePlate(claim.vehicleId)})
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-outline font-bold uppercase mb-1">Dinâmica da Colisão (COMO)</label>
                  <textarea 
                    rows={3}
                    disabled={claim.isFrozen && !overrideReason}
                    value={ocorrenciaDynamics}
                    onChange={(e) => setOcorrenciaDynamics(e.target.value)}
                    placeholder="Descrição da dinâmica física da colisão..."
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded font-mono"
                  />
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={savingOcorrencia || (claim.isFrozen && !overrideReason)}
                    className="px-5 py-2 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-all shadow-sm"
                  >
                    {savingOcorrencia ? "Gravando..." : "Salvar Dados Ocorrência"}
                  </button>
                </div>
              </form>

              {/* Inline Maps preview */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-3">
                <p className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>📍 Local da Batida (Geolocalização Ativa)</span>
                </p>
                <iframe
                  src={`https://maps.google.com/maps?q=${ocorrenciaLat},${ocorrenciaLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-52 rounded-xl border border-outline-variant/60 shadow-inner"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            {/* Approval widget panel */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
                <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Aprovação Processual</span>
                </p>

                <div className="space-y-3 pt-2">
                  <textarea
                    rows={3}
                    placeholder="Adicione observações da diretoria ou parecer do analista..."
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprovalSubmit("approved")}
                      disabled={submittingApproval}
                      className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[11px] transition-all"
                    >
                      Aprovar Reparo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalSubmit("rejected")}
                      disabled={submittingApproval}
                      className="py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-[11px] transition-all"
                    >
                      Rejeitar / Glosar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHECKLIST TÉCNICO */}
        {dossierTab === "checklist" && (
          <form onSubmit={handleSaveChecklistFields} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
            <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
              <FileCheck className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
                  Checklist Técnico & Gravidade Recomendada
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Checklist operacional detalhado do estado do veículo na vistoria do sinistro.
                </p>
              </div>
            </div>

            {claim.isFrozen && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-amber-800 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Dossiê Congelado (SHA-256 Cripto-Lock Ativo)</span>
                </p>
                <p className="text-[10px] leading-tight font-medium">
                  Modificações neste checklist exigem justificativa para versionar o histórico do sinistro.
                </p>
                <div className="space-y-1">
                  <label className="block text-[8px] font-black uppercase text-slate-700">Justificativa de Override *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Correção de vistoria técnica do motor..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded outline-none"
                  />
                </div>
              </div>
            )}

            {/* Severity Suggestion */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-primary">Motor de Sinistros - Gravidade Estimada</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                  Com base no estado das variáveis técnicas abaixo, o sistema sugere a classificação de gravidade:
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white font-extrabold text-xs uppercase shadow">
                  {severityLabels[calculatedSeverity]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Motor dá partida?", value: startsEngine, set: setStartsEngine },
                { label: "Veículo se move?", value: vehicleMoves, set: setVehicleMoves },
                { label: "Direção alinhada/OK?", value: steeringOk, set: setSteeringOk },
                { label: "Freios operacionais?", value: brakesOk, set: setBrakesOk },
                { label: "Radiador/Arrefecimento OK?", value: coolingSystemOk, set: setCoolingSystemOk },
                { label: "Sistema elétrico OK?", value: electricalSystemOk, set: setElectricalSystemOk },
                { label: "Airbags disparados?", value: airbagsDeployed, set: setAirbagsDeployed },
                { label: "Vazamento de fluídos?", value: fluidLeak, set: setFluidLeak },
                { label: "Suspensão danificada?", value: suspensionDamage, set: setSuspensionDamage },
                { label: "Rodas/Pneus afetados?", value: wheelDamage, set: setWheelDamage },
                { label: "Pára-brisa trincado?", value: windshieldDamage, set: setWindshieldDamage },
                { label: "Faróis quebrados?", value: headlightDamage, set: setHeadlightDamage }
              ].map((item, idx) => (
                <label key={idx} className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 border rounded-lg hover:bg-slate-100/60">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <input
                    type="checkbox"
                    disabled={claim.isFrozen && !overrideReason}
                    checked={item.value}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4 h-4 text-primary border-outline rounded"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="submit"
                disabled={claim.isFrozen && !overrideReason}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
              >
                Salvar Checklist & Gravidade
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: DAMAGE MAP */}
        {dossierTab === "damages" && (
          <VehicleDamageMap
            value={claim.damageMap || []}
            onChange={async (newMap) => {
              await updateClaimFields(claim.id, { damageMap: newMap }, claim.isFrozen ? overrideReason : undefined);
            }}
            readOnly={claim.isFrozen}
          />
        )}

        {/* TAB 4: EVIDÊNCIAS & CUSTODY CHAIN */}
        {dossierTab === "evidence" && (
          <div className="space-y-6">
            <EvidenceUploader 
              evidences={evidences} 
              onAddEvidence={async (type, url) => { 
                await addEvidence(claim.id, type, url); 
              }} 
            />

            {/* Custody chain details */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
              <p className="text-[10px] font-black uppercase text-primary flex items-center gap-1 border-b pb-2">
                <FileDigit className="w-4 h-4 text-primary" />
                <span>Cadeia de Custódia Legal das Evidências (Anti-Fraud Evidence Log)</span>
              </p>

              {claimEvidenceChain.length === 0 ? (
                <p className="text-xs italic text-outline py-4 text-center">Aguardando geração de custódia na simulação de novas fotos.</p>
              ) : (
                <div className="overflow-x-auto text-[10px] font-medium text-slate-800">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-outline uppercase font-bold text-[8px]">
                        <th className="py-2">Arquivo</th>
                        <th className="py-2">Enviado Por</th>
                        <th className="py-2">Data/Hora</th>
                        <th className="py-2">Dispositivo</th>
                        <th className="py-2 font-mono">GPS Ocorrência</th>
                        <th className="py-2 font-mono">MD5 Hash (Fingerprint)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      {claimEvidenceChain.map((ec) => {
                        const originalEv = evidences.find(e => e.id === ec.evidenceId);
                        return (
                          <tr key={ec.id} className="hover:bg-slate-50">
                            <td className="py-2 font-bold text-primary">{originalEv?.fileType || "Evidência"}</td>
                            <td className="py-2">{ec.uploadedBy}</td>
                            <td className="py-2">{new Date(ec.uploadedAt).toLocaleString("pt-BR")}</td>
                            <td className="py-2">{ec.device}</td>
                            <td className="py-2 font-bold text-slate-600">{ec.gps?.lat.toFixed(4)}, {ec.gps?.lng.toFixed(4)}</td>
                            <td className="py-2 text-[9px] text-emerald-600 font-extrabold">{ec.fileHash}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: POLICE REPORT (BO) */}
        {dossierTab === "bo" && (
          <PoliceReportCard initialValue={policeReport} onSave={async (f) => { await savePoliceReportDetails(claim.id, f); }} />
        )}

        {/* TAB 6: THIRD PARTY */}
        {dossierTab === "thirdparty" && (
          <ThirdPartyForm initialValue={tpForm} onSave={async (f) => { await saveThirdParty(claim.id, f); }} />
        )}

        {/* TAB 7: WORKSHOP & STOCK */}
        {dossierTab === "workshop" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Budgets list */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1">
                <Settings className="w-4 h-4 text-primary" />
                <span>Orçamentos Recebidos & OS de Funilaria</span>
              </p>

              {/* Cost Predictor warning card */}
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-primary">Previsão Inteligente de Custos</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                    Média histórica do FleetOS para colisões do tipo <span className="font-bold text-primary">{severityLabels[claim.severity]}</span>:
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-extrabold text-xs shadow-sm font-mono">
                  R$ {historicalAvgCost.toLocaleString("pt-BR")}
                </span>
              </div>

              {budgets.length === 0 ? (
                <p className="text-xs italic text-outline text-center py-6">Nenhum orçamento cadastrado para este sinistro.</p>
              ) : (
                <div className="space-y-3">
                  {budgets.map((b) => {
                    const exceededPercent = Math.round(((b.amount - historicalAvgCost) / historicalAvgCost) * 100);
                    const isExceeded = b.amount > historicalAvgCost * 1.25;

                    return (
                      <div
                        key={b.id}
                        className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          b.status === "approved"
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : "bg-slate-50 border-outline-variant/60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-primary">{b.workshopName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              b.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-mono">{b.description}</p>
                          <p className="text-xs font-black text-primary font-mono">
                            R$ {b.amount.toLocaleString("pt-BR")}
                          </p>
                          {isExceeded && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20 text-[8px] font-black uppercase">
                              ⚠️ Acima da média histórica (+{exceededPercent}%)
                            </span>
                          )}
                        </div>

                        {b.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => approveBudget(claim, b.id)}
                            className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg text-xs hover:bg-emerald-600 transition-all shrink-0"
                          >
                            Aprovar Orçamento & Baixar Estoque
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Register budget Form */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist">Novo Orçamento Oficina</p>

              <form onSubmit={handleAddBudgetSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Oficina</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome da Oficina"
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="0,00"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Descrição</label>
                  <input
                    type="text"
                    placeholder="Resumo dos reparos"
                    value={budgetDesc}
                    onChange={(e) => setBudgetDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">URL Comprovante</label>
                  <input
                    type="text"
                    placeholder="Link PDF orçamento"
                    value={budgetUrl}
                    onChange={(e) => setBudgetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none text-on-surface"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingBudget}
                  className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
                >
                  Registrar Orçamento
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: INSURANCE */}
        {dossierTab === "insurance" && (
          <InsurancePanel initialValue={insuranceDetails} onSave={async (f) => { await saveInsuranceDetails(claim.id, f); }} />
        )}

        {/* TAB 9: FINANCIAL SPLITS & BILLING */}
        {dossierTab === "recovery" && (
          <div className="space-y-6">
            <RecoveryPanel initialValue={financialRecovery} onSave={async (f) => { await saveFinancialRecoveryDetails(claim.id, f); }} />

            {/* Billing launcher details */}
            {claim.status !== "charged" && claim.status !== "closed" && (
              <form onSubmit={handleConfirmBillingSubmit} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
                <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist">Faturar Franquia no Extrato Motorista</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Valor Faturamento (R$)</label>
                    <input
                      type="number"
                      required
                      value={billingTotal}
                      onChange={(e) => setBillingTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Número de Parcelas</label>
                    <select
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded-lg text-xs outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((i) => (
                        <option key={i} value={i}>{i}x</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={billingSubmitting}
                      className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
                    >
                      Lançar Cobrança no Caixa
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 10: RECUPERAÇÃO JURÍDICA */}
        {dossierTab === "juridico" && (
          <form onSubmit={handleSaveJuridico} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl max-w-xl mx-auto">
            <div className="flex items-center space-x-2 border-b border-outline-variant pb-3">
              <LandmarkIcon className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-geist text-xs font-bold text-primary uppercase tracking-wider">
                  ⚖ Recuperação Judicial de Sinistros
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Acompanhamento de processos judiciais civis para ressarcimento de perdas de terceiros ou acionamentos legais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Número do Processo Judicial</label>
                <input
                  type="text"
                  placeholder="Ex: 1002344-88.2026.8.26.0100"
                  value={lawsuitNumber}
                  onChange={(e) => setLawsuitNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Advogado Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Mauro de Alencar"
                  value={attorneyName}
                  onChange={(e) => setAttorneyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Parte Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Terceiro / Motorista"
                  value={responsibleParty}
                  onChange={(e) => setResponsibleParty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Custas Processuais (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={legalCosts}
                  onChange={(e) => setLegalCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Valor Acordo/Sentença (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-outline font-bold uppercase mb-1.5">Status Jurídico</label>
                <select
                  value={juridicoStatus}
                  onChange={(e) => setJuridicoStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-outline-variant rounded text-xs font-bold"
                >
                  <option value="ongoing">Em Andamento</option>
                  <option value="settled">Acordo Firmado / Pago</option>
                  <option value="appealed">Em Fase de Recurso</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="submit"
                disabled={savingJuridico}
                className="px-5 py-2 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-all text-xs"
              >
                {savingJuridico ? "Gravando..." : "Salvar Dossiê Jurídico"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 11: TIMELINE */}
        {dossierTab === "timeline" && (
          <ClaimTimeline events={timelineEvents} />
        )}

        {/* TAB 12: AUDITORIA & ANTIFRAUDE */}
        {dossierTab === "audit" && (
          <div className="space-y-6">
            
            {/* Dashboard Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-outline-variant/60 p-4.5 rounded-xl space-y-1 shadow-sm">
                <span className="text-[9px] text-outline uppercase font-bold">Risco Antifraude</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    claimRiskAnalysis && claimRiskAnalysis.riskScore > 50 
                      ? "bg-red-500 text-white" 
                      : "bg-emerald-500 text-white"
                  }`}>
                    {claimRiskAnalysis?.status === "suspicious" ? "CRÍTICO / SUSPEITO" : "NORMAL / FICHA LIMPA"}
                  </span>
                  <span className="text-xs font-mono font-bold">({claimRiskAnalysis?.riskScore || 10}/100)</span>
                </div>
                <div className="pt-1.5 flex flex-wrap gap-1">
                  {claimRiskAnalysis?.flags && claimRiskAnalysis.flags.length > 0 ? (
                    claimRiskAnalysis.flags.map((f, i) => (
                      <span key={i} className="px-1.5 py-0.2 bg-red-100 text-red-700 border border-red-200 text-[8px] font-black rounded uppercase">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-outline italic">Nenhuma suspeita detectada.</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-outline-variant/60 p-4.5 rounded-xl space-y-1 shadow-sm">
                <span className="text-[9px] text-outline uppercase font-bold">Assinatura do Dossiê</span>
                <p className="text-[8.5px] font-mono text-slate-500 break-all leading-tight font-bold select-all">
                  {claim.sha256Fingerprint || "N/A - Aguardando Encerramento do Processo"}
                </p>
                <span className="text-[9px] text-outline block italic">Hashed digital signature SHA-256</span>
              </div>

              <div className="bg-slate-50 border border-outline-variant/60 p-4.5 rounded-xl space-y-1 shadow-sm">
                <span className="text-[9px] text-outline uppercase font-bold">Versionamento Ativo</span>
                <p className="text-xs font-bold text-primary">Edições Registradas: {claimVersions.length + 1}ª Versão</p>
                {claimVersions.length > 0 && (
                  <div className="pt-1 flex gap-1.5">
                    {claimVersions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVersionText(v.snapshot)}
                        className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 font-black font-mono text-[8px] rounded text-slate-700 uppercase"
                      >
                        Ver v{v.versionNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Version Snapshot popup/card viewer */}
            {selectedVersionText && (
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-700 font-mono text-[10px] space-y-2 relative">
                <div className="flex justify-between items-center text-white border-b border-slate-700 pb-1.5 font-bold">
                  <span>Visualizador de Snapshot de Auditoria</span>
                  <button onClick={() => setSelectedVersionText(null)} className="text-xs hover:underline text-red-400">Fechar</button>
                </div>
                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(JSON.parse(selectedVersionText), null, 2)}</pre>
              </div>
            )}

            {/* Audit Log Table */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
              <p className="text-[10px] font-black uppercase text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Logs Imutáveis de Auditoria (Immutable Log Repository)</span>
              </p>

              {claimAuditLogs.length === 0 ? (
                <p className="text-xs italic text-outline py-4 text-center">Nenhuma alteração de auditoria efetuada neste sinistro ainda.</p>
              ) : (
                <div className="overflow-x-auto text-[10px] font-medium text-slate-800">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-outline uppercase font-bold text-[8px]">
                        <th className="py-2">Campo Modificado</th>
                        <th className="py-2">Valor Anterior</th>
                        <th className="py-2">Novo Valor</th>
                        <th className="py-2">Usuário</th>
                        <th className="py-2 font-mono">Timestamp</th>
                        <th className="py-2 font-mono">Assinatura Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      {claimAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-2 font-bold text-primary">{log.field}</td>
                          <td className="py-2 text-red-600 line-through truncate max-w-[120px]">{log.oldValue || "N/A"}</td>
                          <td className="py-2 text-emerald-600 font-bold truncate max-w-[120px]">{log.newValue || "N/A"}</td>
                          <td className="py-2">{log.createdBy}</td>
                          <td className="py-2">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                          <td className="py-2 text-[9px] text-slate-400 truncate max-w-[150px]">{log.hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
