import React, { useState, useEffect } from "react";
import {
  Shield,
  X,
  Sliders,
  Camera,
  User,
  Hammer,
  FileText,
  CreditCard,
  UserCheck,
  FileCheck,
  Plus,
  MapPin,
  Upload,
  FileUp,
  Check,
  CheckCircle,
  History
} from "lucide-react";
import {
  Claim,
  ChecklistForm,
  BoForm,
  TpForm,
  ClaimEvidence,
  ClaimDamageItem,
  ClaimBudget,
  ClaimInstallment,
  ClaimApproval
} from "../_lib/types";
import { isValidHttpUrl } from "../_lib/helpers";
import { getStatusBadge, getSeverityBadge } from "./ClaimsTable";

interface ClaimDetailsModalProps {
  claim: Claim;
  onClose: () => void;
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

  // Selection states
  activeTab: string;
  setActiveTab: (t: string) => void;

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
}

export function ClaimDetailsModal({
  claim,
  onClose,
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
  activeTab,
  setActiveTab,
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
  closeClaim
}: ClaimDetailsModalProps) {
  // Local sub-form states
  const [evidenceType, setEvidenceType] = useState("Foto");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const [selectedPresetPartId, setSelectedPresetPartId] = useState("");
  const [customPartName, setCustomPartName] = useState("");
  const [damageSeverity, setDamageSeverity] = useState("light");
  const [damageCost, setDamageCost] = useState(0);

  const [budgetFormLocal, setBudgetFormLocal] = useState({
    workshopName: "",
    amount: 0,
    description: "",
    attachmentUrl: ""
  });

  const [billingTotal, setBillingTotal] = useState(0);
  const [billingInstallmentsCount, setBillingInstallmentsCount] = useState(3);
  const [billingDescription, setBillingDescription] = useState("");

  const [approvalComments, setApprovalComments] = useState("");

  // Sync billing values when budgets or claim changes
  useEffect(() => {
    const approvedBdg = budgets.find(b => b.status === "approved");
    if (approvedBdg) {
      setBillingTotal(approvedBdg.amount);
    }
    setBillingDescription(
      `Cobrança de Coparticipação/Franquia de Sinistro ${claim.claimNumber} (${claim.location})`
    );
  }, [budgets, claim]);

  const handlePresetPartChange = (partId: string) => {
    setSelectedPresetPartId(partId);
    const part = priceTable.find(p => p.id === partId);
    if (part) {
      setCustomPartName(part.item);
      setDamageCost(part.suggestedCost);
    } else {
      setCustomPartName("");
      setDamageCost(0);
    }
  };

  const onAddEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl) return;
    if (evidenceUrl && !isValidHttpUrl(evidenceUrl)) {
      alert("Por favor, insira uma URL válida (começando com http:// ou https://).");
      return;
    }
    await addEvidence(claim.id, evidenceType, evidenceUrl);
    setEvidenceUrl("");
  };

  const onSaveBOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (boForm.attachmentUrl && !isValidHttpUrl(boForm.attachmentUrl)) {
      alert("Por favor, insira uma URL de anexo válida (começando com http:// ou https://).");
      return;
    }
    await saveBO(claim.id, boForm);
  };

  const onSaveThirdPartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveThirdParty(claim.id, tpForm);
  };

  const onAddDamageItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPartName) return;
    await addDamageItem(claim.id, customPartName, damageSeverity, damageCost);
    setCustomPartName("");
    setSelectedPresetPartId("");
    setDamageCost(0);
  };

  const onAddBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetFormLocal.workshopName) return;
    if (budgetFormLocal.attachmentUrl && !isValidHttpUrl(budgetFormLocal.attachmentUrl)) {
      alert("Por favor, insira uma URL de orçamento válida (começando com http:// ou https://).");
      return;
    }
    await addBudget(
      claim.id,
      budgetFormLocal.workshopName,
      budgetFormLocal.amount,
      budgetFormLocal.description,
      budgetFormLocal.attachmentUrl
    );
    setBudgetFormLocal({ workshopName: "", amount: 0, description: "", attachmentUrl: "" });
  };

  const onConfirmBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billingTotal <= 0) return;
    await confirmBilling(claim, billingTotal, billingInstallmentsCount, billingDescription);
  };

  const onRoleApprovalSubmit = async (status: "approved" | "rejected") => {
    await roleApproval(claim, status, approvalComments);
    setApprovalComments("");
  };

  const userRoleName = currentUser?.roleId
    ? currentUser.roleId.replace("role-", "").toUpperCase()
    : currentUser?.role.toUpperCase() || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-primary font-geist flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-primary" />
                <span>Gestão Processual de Sinistro: {claim.claimNumber}</span>
              </h3>
              {getStatusBadge(claim.status)}
              {getSeverityBadge(claim.severity)}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Veículo: {getVehiclePlate(claim.vehicleId)} | Condutor: {getDriverName(claim.driverId)}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-outline-variant bg-slate-50 flex overflow-x-auto text-xs font-semibold">
          {[
            { id: "details", label: "Checklist & Abertura", icon: Sliders },
            { id: "evidence", label: "Evidências & BO", icon: Camera },
            { id: "thirdparty", label: "Terceiros Envolvidos", icon: User },
            { id: "damages", label: "Avaliação de Danos", icon: Hammer },
            { id: "budgets", label: "Orçamentos Oficinas", icon: FileText },
            { id: "billing", label: "Cobrança & Parcelas", icon: CreditCard },
            { id: "approvals", label: "Parecer & Linha do Tempo", icon: UserCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-5 py-3 border-b-2 transition-all shrink-0 ${
                  isAct
                    ? "border-primary text-primary bg-white font-bold"
                    : "border-transparent text-on-surface-variant hover:text-primary hover:bg-white/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body (Tab Contents) */}
        <div className="flex-1 overflow-y-auto p-6 text-xs min-h-0">
          {/* TAB 1: DETAILS & CHECKLIST */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-2.5">
                    <p className="font-bold text-primary uppercase text-[10px]">Informações Gerais da Ocorrência</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-outline block">Data e Hora</span>
                        <span className="font-semibold text-primary">
                          {new Date(claim.occurrenceDate).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div>
                        <span className="text-outline block">Local</span>
                        <span className="font-semibold text-primary">{claim.location}</span>
                      </div>
                      <div>
                        <span className="text-outline block">Veículo Funcionando?</span>
                        <span className="font-semibold text-primary">
                          {claim.vehicleDrivable ? "Sim (Mecânica OK)" : "Não (Reboque Necessário)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-outline block">Envolveu Terceiros / Vítimas?</span>
                        <span className="font-semibold text-primary">
                          {claim.involvedThirdParties ? "Terceiros envolvidos" : "Apenas veículo da frota"}
                          {claim.hasVictims ? " (Com vítimas)" : " (Sem vítimas)"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-outline block">Relato do Ocorrido</span>
                      <p className="text-primary font-mono mt-1 whitespace-pre-wrap">{claim.description}</p>
                    </div>
                  </div>
                </div>

                {/* Vistoria Checklist Column */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                    <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span>Checklist Vistoria de Sinistro</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      Confirme o recebimento das imagens obrigatórias abaixo antes da aprovação de orçamentos.
                    </p>

                    <div className="space-y-2 pt-2 border-t">
                      {[
                        { id: "frontPhotos", label: "Fotos da Frente" },
                        { id: "rearPhotos", label: "Fotos da Traseira" },
                        { id: "sidePhotos", label: "Fotos Laterais" },
                        { id: "dashboardPhoto", label: "Foto do Painel" },
                        { id: "odometerPhoto", label: "Foto do Hodômetro" },
                        { id: "crlvAttached", label: "Documento CRLV Veículo" },
                        { id: "cnhAttached", label: "CNH Condutor Atualizada" }
                      ].map(item => (
                        <label
                          key={item.id}
                          className="flex items-center justify-between cursor-pointer py-1 border-b border-dashed border-outline-variant/65"
                        >
                          <span className="font-semibold">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={(checklistForm as any)[item.id]}
                            onChange={e => setChecklistForm({ ...checklistForm, [item.id]: e.target.checked })}
                            className="w-4 h-4 text-primary border-outline rounded"
                          />
                        </label>
                      ))}
                    </div>

                    {can("claims.edit") && (
                      <button
                        onClick={() => updateChecklist(claim.id, checklistForm)}
                        type="button"
                        className="w-full mt-3 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-[11px]"
                      >
                        Salvar Checklist Vistoria
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE & POLICE REPORT (BO) */}
          {activeTab === "evidence" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Evidences / Photos Upload */}
              <div className="space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px]">Mídia & Evidências de Danos</p>

                  {can("claims.edit") && (
                    <form onSubmit={onAddEvidenceSubmit} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">Tipo de Mídia</label>
                        <select
                          value={evidenceType}
                          onChange={e => setEvidenceType(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none text-on-surface"
                        >
                          <option value="Foto">Foto do Dano</option>
                          <option value="Vídeo">Vídeo Relato</option>
                          <option value="Áudio">Áudio Oitiva</option>
                          <option value="PDF">Laudo Técnico PDF</option>
                        </select>
                      </div>
                      <div className="flex-[2]">
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          URL da Evidência
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="https://exemplo.com/dano.jpg"
                          value={evidenceUrl}
                          onChange={e => setEvidenceUrl(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-primary text-on-primary rounded font-bold hover:opacity-90 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Vincular</span>
                      </button>
                    </form>
                  )}

                  {/* Evidence Gallery List */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {evidences.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-outline">
                        Nenhuma foto de dano vinculada ao processo.
                      </div>
                    ) : (
                      evidences.map((ev: any) => (
                        <div
                          key={ev.id}
                          className="relative group border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col justify-between"
                        >
                          {ev.fileType === "Foto" ? (
                            <img src={ev.fileUrl} alt="Evidência" className="w-full h-24 object-cover" />
                          ) : (
                            <div className="h-24 bg-slate-100 flex items-center justify-center text-outline">
                              <FileText className="w-8 h-8" />
                            </div>
                          )}
                          <div className="p-2 border-t bg-slate-50 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-primary">{ev.fileType}</span>
                            <span className="text-outline">{new Date(ev.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Boletim de Ocorrência (BO) Form */}
              <div className="space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1.5">
                    <FileUp className="w-4 h-4 text-primary" />
                    <span>Boletim de Ocorrência Policial (B.O.)</span>
                  </p>

                  <form onSubmit={onSaveBOSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">Número do BO</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: BO-987654/2026"
                          value={boForm.reportNumber}
                          onChange={e => setBoForm({ ...boForm, reportNumber: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Delegacia / DP
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 78º Distrito Policial"
                          value={boForm.policeStation}
                          onChange={e => setBoForm({ ...boForm, policeStation: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Data Registro BO
                        </label>
                        <input
                          type="date"
                          required
                          value={boForm.reportDate}
                          onChange={e => setBoForm({ ...boForm, reportDate: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Link PDF BO (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="https://exemplo.com/bo.pdf"
                          value={boForm.attachmentUrl}
                          onChange={e => setBoForm({ ...boForm, attachmentUrl: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none font-mono"
                        />
                      </div>
                    </div>

                    {can("claims.edit") && (
                      <button
                        type="submit"
                        className="w-full py-2 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-all"
                      >
                        Salvar Boletim de Ocorrência
                      </button>
                    )}
                  </form>

                  {boForm.reportNumber && (
                    <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-primary">BO Vinculado Ativo</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">
                            {boForm.reportNumber} - {boForm.policeStation}
                          </p>
                        </div>
                      </div>
                      {boForm.attachmentUrl && (
                        <a
                          href={boForm.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-primary rounded border font-bold"
                        >
                          Visualizar PDF
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THIRD PARTIES */}
          {activeTab === "thirdparty" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-50 border p-5 rounded-xl space-y-4">
                <div>
                  <p className="font-bold text-primary uppercase text-[10px]">Terceiro Envolvido no Sinistro</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Preencha as informações do proprietário/condutor do outro veículo envolvido.
                  </p>
                </div>

                <form onSubmit={onSaveThirdPartySubmit} className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Digitar nome..."
                        value={tpForm.name}
                        onChange={e => setTpForm({ ...tpForm, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">CPF Terceiro</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={tpForm.cpf}
                        onChange={e => setTpForm({ ...tpForm, cpf: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                        Telefone Contato
                      </label>
                      <input
                        type="text"
                        placeholder="(11) 98888-8888"
                        value={tpForm.phone}
                        onChange={e => setTpForm({ ...tpForm, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">Placa Veículo</label>
                      <input
                        type="text"
                        placeholder="XYZ-1234"
                        value={tpForm.plate}
                        onChange={e => setTpForm({ ...tpForm, plate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                        Veículo (Marca/Modelo)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Honda Civic"
                        value={tpForm.vehicle}
                        onChange={e => setTpForm({ ...tpForm, vehicle: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                      Seguradora do Terceiro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Porto Seguro S/A"
                      value={tpForm.insurer}
                      onChange={e => setTpForm({ ...tpForm, insurer: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                    />
                  </div>

                  {can("claims.edit") && (
                    <button
                      type="submit"
                      className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all mt-2"
                    >
                      Salvar Dados de Terceiros
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: DAMAGE ASSESSMENT */}
          {activeTab === "damages" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Preset pricing suggestions list */}
              <div className="space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-3 text-on-surface-variant">
                  <p className="font-bold text-primary uppercase text-[10px]">Tabela de Preços Referenciais</p>
                  <p className="text-[10px]">Valores médios autorizados de peças para estimativa rápida:</p>

                  <div className="space-y-1.5 pt-2 border-t font-mono text-[11px] text-primary">
                    {priceTable.map(part => (
                      <div
                        key={part.id}
                        className="flex justify-between items-center py-1 border-b border-dashed border-outline-variant/60"
                      >
                        <span>{part.item}</span>
                        <span className="font-bold">R$ {part.suggestedCost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Damage Item Creation Form */}
              <div className="col-span-2 space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px]">Peças Afetadas e Avaliação de Danos</p>

                  {can("claims.edit") && (
                    <form
                      onSubmit={onAddDamageItemSubmit}
                      className="grid grid-cols-4 gap-3 items-end bg-white p-3 border border-outline-variant/65 rounded-lg"
                    >
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Selecionar Peça Tabela
                        </label>
                        <select
                          value={selectedPresetPartId}
                          onChange={e => handlePresetPartChange(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-outline-variant rounded text-xs text-on-surface outline-none"
                        >
                          <option value="">Personalizar Peça/Item...</option>
                          {priceTable.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.item} (Sugestão: R$ {p.suggestedCost})
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          required
                          placeholder="Ou digite o nome da peça..."
                          value={customPartName}
                          onChange={e => setCustomPartName(e.target.value)}
                          className="w-full px-2 py-1 mt-2 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Custo Estimado (R$)
                        </label>
                        <input
                          type="number"
                          required
                          value={damageCost}
                          onChange={e => setDamageCost(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-outline-variant rounded text-xs text-on-surface outline-none font-mono"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-primary text-on-primary font-bold rounded text-xs hover:opacity-90 flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Damages List */}
                  <div className="pt-2 border-t">
                    <table className="w-full text-left">
                      <thead className="font-bold text-outline border-b border-outline-variant">
                        <tr>
                          <th className="py-2">Peça / Dano</th>
                          <th className="py-2">Status Gravidade</th>
                          <th className="py-2 text-right">Custo Estimado</th>
                          {can("claims.edit") && <th className="py-2 text-right">Ação</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/50">
                        {damageItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-outline">
                              Nenhum item adicionado à avaliação de danos deste veículo.
                            </td>
                          </tr>
                        ) : (
                          damageItems.map(item => (
                            <tr key={item.id}>
                              <td className="py-2.5 font-bold text-primary">{item.item}</td>
                              <td className="py-2.5">
                                <span className="bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded text-[9px] border border-amber-500/20">
                                  Avaliado
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-bold font-mono">
                                R$ {item.estimatedCost.toLocaleString()}
                              </td>
                              {can("claims.edit") && (
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={() => deleteDamageItem(claim.id, item.id)}
                                    type="button"
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    Remover
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {damageItems.length > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t mt-2 font-geist">
                        <span className="text-outline font-bold uppercase text-[10px]">Custo Estimado Consolidado</span>
                        <span className="text-base font-black text-primary font-mono">
                          R$ {damageItems.reduce((acc, i) => acc + i.estimatedCost, 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WORKSHOP BUDGETS */}
          {activeTab === "budgets" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Workshop budgets listing */}
              <div className="col-span-2 space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px]">Orçamentos de Funilaria e Pintura</p>

                  <div className="space-y-3">
                    {budgets.length === 0 ? (
                      <div className="py-12 text-center text-outline">
                        Nenhum orçamento cadastrado para avaliação concorrencial.
                      </div>
                    ) : (
                      budgets.map(bdg => {
                        const isApproved = bdg.status === "approved";
                        const isRejected = bdg.status === "rejected";
                        return (
                          <div
                            key={bdg.id}
                            className={`border p-4 rounded-xl flex items-start justify-between bg-white shadow-sm transition-all ${
                              isApproved ? "border-emerald-500 ring-2 ring-emerald-500/10" : ""
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <p className="font-bold text-primary text-sm">{bdg.workshopName}</p>
                                {isApproved && (
                                  <span className="bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded text-[8px] border border-emerald-500/20">
                                    APROVADO & CONTRATADO
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="bg-red-500/10 text-red-500 font-bold px-1.5 py-0.5 rounded text-[8px] border border-red-500/20">
                                    DESCARTADO
                                  </span>
                                )}
                              </div>
                              <p className="text-on-surface-variant font-mono text-[10px] leading-relaxed">
                                {bdg.description}
                              </p>
                              <a
                                href={bdg.attachmentUrl}
                                className="inline-block text-[10px] text-primary underline font-semibold mt-1"
                              >
                                Download Orçamento Oficial (PDF)
                              </a>
                            </div>

                            <div className="text-right space-y-2">
                              <p className="text-base font-black text-primary font-mono">
                                R$ {bdg.amount.toLocaleString()}
                              </p>
                              {can("claims.edit") && bdg.status === "pending" && (
                                <button
                                  onClick={() => approveBudget(claim, bdg.id)}
                                  type="button"
                                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-650 text-white rounded font-bold transition-all shadow-sm text-[10px] block w-full"
                                >
                                  Aprovar & Contratar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Cost analysis & register form */}
              <div className="space-y-4">
                {/* budget comparison stats */}
                {budgets.length > 0 && (
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-3 font-semibold text-on-surface-variant">
                    <p className="font-bold text-primary uppercase text-[10px]">Análise Comparativa de Preços</p>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className="bg-white border p-2 rounded">
                        <span className="text-[8px] text-outline block">MENOR VALOR</span>
                        <span className="font-bold text-emerald-600 font-mono text-[11px]">
                          R$ {Math.min(...budgets.map(b => b.amount)).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white border p-2 rounded">
                        <span className="text-[8px] text-outline block">MÉDIA ORÇADA</span>
                        <span className="font-bold text-primary font-mono text-[11px]">
                          R$ {Math.round(budgets.reduce((acc, b) => acc + b.amount, 0) / budgets.length).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white border p-2 rounded">
                        <span className="text-[8px] text-outline block">MAIOR VALOR</span>
                        <span className="font-bold text-red-600 font-mono text-[11px]">
                          R$ {Math.max(...budgets.map(b => b.amount)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {can("claims.edit") && (
                  <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                    <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                      <Upload className="w-4 h-4 text-primary" />
                      <span>Adicionar Orçamento Oficina</span>
                    </p>

                    <form onSubmit={onAddBudgetSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">Nome Oficina</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Oficina Central"
                          value={budgetFormLocal.workshopName}
                          onChange={e => setBudgetFormLocal({ ...budgetFormLocal, workshopName: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                            Valor Total (R$)
                          </label>
                          <input
                            type="number"
                            required
                            value={budgetFormLocal.amount || ""}
                            onChange={e => setBudgetFormLocal({ ...budgetFormLocal, amount: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-white border border-outline-variant rounded outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                            PDF Orçamento
                          </label>
                          <input
                            type="text"
                            placeholder="Link PDF..."
                            value={budgetFormLocal.attachmentUrl}
                            onChange={e => setBudgetFormLocal({ ...budgetFormLocal, attachmentUrl: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-outline-variant rounded outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">
                          Descrição Serviços
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Descrição resumida..."
                          value={budgetFormLocal.description}
                          onChange={e => setBudgetFormLocal({ ...budgetFormLocal, description: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-outline-variant rounded outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-primary text-on-primary font-bold rounded hover:opacity-90"
                      >
                        Registrar Orçamento
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CHARGING & INSTALLMENTS */}
          {activeTab === "billing" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-slate-50 border p-5 rounded-xl space-y-4">
                <div>
                  <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Faturamento de Franquia / Coparticipação</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Lançamento financeiro do valor de franquia na conta corrente do motorista parceiro.
                  </p>
                </div>

                {claim.status === "charged" ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-xl space-y-3">
                    <div className="flex items-center space-x-2 font-bold">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>Sinistro Faturado no Extrato do Motorista!</span>
                    </div>
                    {installments.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t font-mono text-[11px] text-primary border-emerald-500/20">
                        <p>
                          Valor Consolidado: <span className="font-bold">R$ {installments[0].totalAmount.toLocaleString()}</span>
                        </p>
                        <p>
                          Parcelamento:{" "}
                          <span className="font-bold font-mono">
                            {installments[0].installments}x de R$ {installments[0].installmentAmount.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={onConfirmBillingSubmit} className="space-y-4 pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Total a Cobrar (R$)
                        </label>
                        <input
                          type="number"
                          required
                          value={billingTotal || ""}
                          onChange={e => setBillingTotal(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs outline-none text-on-surface font-mono"
                        />
                        <span className="text-[10px] text-outline mt-1 block">Sugerido do orçamento aprovado</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Quantidade de Parcelas
                        </label>
                        <select
                          value={billingInstallmentsCount}
                          onChange={e => setBillingInstallmentsCount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                            <option key={n} value={n}>
                              {n}x parcelas
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                        Descrição para Extrato
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Descreva o motivo que aparecerá para o motorista..."
                        value={billingDescription}
                        onChange={e => setBillingDescription(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
                      />
                    </div>

                    {billingTotal > 0 && (
                      <div className="bg-slate-100 p-4 border border-outline-variant/60 rounded-xl space-y-1.5">
                        <p className="font-bold text-primary uppercase text-[10px]">Simulador de Lançamento em Extrato</p>
                        <p className="font-bold text-sm text-primary font-mono">
                          {billingInstallmentsCount}x de R$ {(billingTotal / billingInstallmentsCount).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          Os lançamentos serão deduzidos do saldo na conta corrente (`driver_ledger`) do motorista parceiro
                          de forma retroativa/futura.
                        </p>
                      </div>
                    )}

                    {can("claims.edit") && (
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all text-xs"
                      >
                        Confirmar & Faturar no Extrato
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: APPROVALS & TIMELINE */}
          {activeTab === "approvals" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Timeline view */}
              <div className="col-span-2 space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-primary" />
                    <span>Histórico Operacional (Timeline)</span>
                  </p>

                  <div className="relative border-l border-outline pl-5 ml-2.5 space-y-5 text-xs text-on-surface-variant">
                    {/* Static workflow timeline entries */}
                    <div className="relative">
                      <span className="absolute -left-7 top-0.5 bg-primary w-3.5 h-3.5 rounded-full border border-background"></span>
                      <p className="font-bold text-primary">Abertura de Sinistro</p>
                      <p className="text-[10px]">{new Date(claim.occurrenceDate).toLocaleString()}</p>
                      <p className="text-[10px] mt-1 font-mono">{claim.description}</p>
                    </div>

                    {checklistForm.frontPhotos && (
                      <div className="relative">
                        <span className="absolute -left-7 top-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-background flex items-center justify-center text-white"></span>
                        <p className="font-bold text-primary">Vistoria e Imagens Validadas</p>
                        <p className="text-[10px]">Fotos e documentos anexados com sucesso.</p>
                      </div>
                    )}

                    {boForm.reportNumber && (
                      <div className="relative">
                        <span className="absolute -left-7 top-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-background"></span>
                        <p className="font-bold text-primary">BO Policial Anexado</p>
                        <p className="text-[10px]">
                          Número {boForm.reportNumber} registrado por {claim.createdBy}.
                        </p>
                      </div>
                    )}

                    {budgets
                      .filter(b => b.status === "approved")
                      .map(b => (
                        <div key={b.id} className="relative">
                          <span className="absolute -left-7 top-0.5 bg-primary w-3.5 h-3.5 rounded-full border border-background"></span>
                          <p className="font-bold text-primary">Orçamento Oficina Aprovado</p>
                          <p className="text-[10px]">
                            {b.workshopName} - R$ {b.amount}
                          </p>
                        </div>
                      ))}

                    {claim.status === "charged" && (
                      <div className="relative">
                        <span className="absolute -left-7 top-0.5 bg-cyan-600 w-3.5 h-3.5 rounded-full border border-background"></span>
                        <p className="font-bold text-primary">Cobrança Faturada</p>
                        <p className="text-[10px]">Débitos gerados na conta corrente do motorista.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Approvals sidecard */}
              <div className="space-y-4">
                <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
                  <p className="font-bold text-primary uppercase text-[10px]">Fluxo de Homologação / Alçada</p>

                  <div className="space-y-3 font-semibold text-[11px] text-on-surface-variant">
                    {[
                      { id: "OPERATIONAL", label: "Operador Vistoriador" },
                      { id: "SUPERVISOR", label: "Supervisor Operações" },
                      { id: "FINANCIAL", label: "Gerente Financeiro" },
                      { id: "OWNER", label: "Diretoria / Dono da Frota" }
                    ].map((alc, idx) => {
                      const appVal = approvals.find(a => a.role === alc.id);
                      return (
                        <div
                          key={alc.id}
                          className="flex justify-between items-start border-b border-dashed border-outline-variant/60 pb-2"
                        >
                          <div>
                            <span className="text-[8px] text-outline block font-bold">ALÇADA {idx + 1}</span>
                            <span>{alc.label}</span>
                            {appVal?.comments && (
                              <p className="text-[9px] font-mono text-outline leading-tight mt-0.5">
                                {appVal.comments}
                              </p>
                            )}
                          </div>
                          {appVal ? (
                            <span className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-500/20">
                              ✓ OK
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              Aguardando
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Approval Action Form */}
                  {claim.status !== "closed" && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="font-bold text-[9px] text-outline uppercase font-sans">
                        Lançar Parecer do Processo
                      </p>
                      <textarea
                        rows={2}
                        placeholder="Comentários, ressalvas ou observações..."
                        value={approvalComments}
                        onChange={e => setApprovalComments(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onRoleApprovalSubmit("rejected")}
                          type="button"
                          className="py-1.5 bg-red-500 text-white font-bold rounded text-center text-[10px] hover:bg-red-650 shadow"
                        >
                          Reprovar / Reter
                        </button>
                        <button
                          onClick={() => onRoleApprovalSubmit("approved")}
                          type="button"
                          className="py-1.5 bg-emerald-500 text-white font-bold rounded text-center text-[10px] hover:bg-emerald-650 shadow"
                        >
                          Aprovar Parecer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Close Claim Process permanently */}
                  {claim.status !== "closed" && (userRoleName === "OWNER" || userRoleName === "SUPER_ADMIN") && (
                    <button
                      onClick={() => closeClaim(claim)}
                      type="button"
                      className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg border border-slate-700 font-sans tracking-wide shadow-sm"
                    >
                      Encerrar Processo de Sinistro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
