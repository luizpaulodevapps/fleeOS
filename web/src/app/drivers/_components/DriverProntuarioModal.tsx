import React, { useState, useEffect } from "react";
import {
  User,
  ShieldAlert,
  Car,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Paperclip,
  FileCheck,
  Activity,
  X,
  Lock,
  Printer,
  FileText,
  PlusCircle,
  FilePlus,
  Check
} from "lucide-react";
import {
  Driver,
  LedgerEntry,
  Occurrence,
  Infraction,
  Attachment,
  DriverFormData,
  OccurrenceFormData,
  DocFormData,
  LedgerFormData,
  InfractionFormData
} from "../_lib/types";
import { isReadOnly, getCNHStatus, getScoreTier } from "../_lib/helpers";

interface DriverProntuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDriver: Driver | null;
  vehicles: any[];
  assignments: any[];
  contracts: any[];
  ledger: LedgerEntry[];
  occurrences: Occurrence[];
  infractions: Infraction[];
  attachments: Attachment[];
  timeline: any[];
  templates: any[];
  can: (perm: string) => boolean;
  currentUser: any;
  getDriverBalance: (id: string) => number;
  onSavePersonalData: (driver: Driver | null, form: DriverFormData) => Promise<void>;
  onSaveLocks: (driver: Driver, locks: string[], justification: Record<string, string>) => Promise<void>;
  onSimulateContract: (driver: Driver, templateId: string, vehicleId: string, dailyRate: number) => Promise<void>;
  onAddOccurrence: (driver: Driver, form: OccurrenceFormData) => Promise<void>;
  onUploadDoc: (driver: Driver, form: DocFormData) => Promise<void>;
  onAddLedgerEntry: (driver: Driver, form: LedgerFormData) => Promise<void>;
  onAddInfraction: (driver: Driver, form: any) => Promise<void>;
  onOpenDossier: (driver: Driver) => void;
}

export function DriverProntuarioModal({
  isOpen,
  onClose,
  selectedDriver,
  vehicles,
  assignments,
  contracts,
  ledger,
  occurrences,
  infractions,
  attachments,
  timeline,
  templates,
  can,
  currentUser,
  getDriverBalance,
  onSavePersonalData,
  onSaveLocks,
  onSimulateContract,
  onAddOccurrence,
  onUploadDoc,
  onAddLedgerEntry,
  onAddInfraction,
  onOpenDossier
}: DriverProntuarioModalProps) {
  const [activeTab, setActiveTab] = useState("personal");

  // Form states - Dados Pessoais
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    cpf: "",
    rg: "",
    phone: "",
    condutax: "",
    condutaxExpiration: "",
    cnhNumber: "",
    cnhCategory: "AB",
    cnhExpiration: "",
    cnhPoints: 0,
    cnhPointsUpdatedAt: "",
    cnhSuspended: false,
    cnhObservation: "",
    address: "",
    emergencyContact: "",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    status: "active",
    birthDate: "",
    civilStatus: "Solteiro(a)",
    notes: "",
    admissionDate: "",
    exitDate: ""
  });

  // Locks Form State
  const [driverLocks, setDriverLocks] = useState<string[]>([]);
  const [lockJustification, setLockJustification] = useState<Record<string, string>>({});

  // Simulation Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [simulatedVehicleId, setSimulatedVehicleId] = useState("");
  const [simulatedDailyRate, setSimulatedDailyRate] = useState(150);

  // New Occurrence Form State
  const [occurrenceForm, setOccurrenceForm] = useState<OccurrenceFormData>({
    type: "Reclamação",
    description: "",
    reportedBy: ""
  });

  // Document Upload Form State
  const [docForm, setDocForm] = useState<DocFormData>({
    fileName: "",
    fileUrl: ""
  });

  // Ledger Posting Form State
  const [ledgerForm, setLedgerForm] = useState<LedgerFormData>({
    type: "daily",
    description: "",
    amount: ""
  });

  // Document Emission Preview State
  const [emissionTemplateId, setEmissionTemplateId] = useState("");
  const [emittedContent, setEmittedContent] = useState("");

  // Infraction Form State
  const [infractionForm, setInfractionForm] = useState<InfractionFormData>({
    date: new Date().toISOString().split("T")[0],
    ait: "",
    agency: "",
    vehicleId: "",
    points: 0,
    amount: "",
    description: "",
    responsible: "",
    status: "Pendente"
  });

  useEffect(() => {
    if (selectedDriver) {
      setFormData({
        name: selectedDriver.name || "",
        cpf: selectedDriver.cpf || "",
        rg: selectedDriver.rg || "",
        phone: selectedDriver.phone || "",
        condutax: selectedDriver.condutax || "",
        condutaxExpiration: selectedDriver.condutaxExpiration || "",
        cnhNumber: selectedDriver.cnhNumber || "",
        cnhCategory: selectedDriver.cnhCategory || "AB",
        cnhExpiration: selectedDriver.cnhExpiration || "",
        cnhPoints: selectedDriver.cnhPoints ?? 0,
        cnhPointsUpdatedAt: selectedDriver.cnhPointsUpdatedAt || "",
        cnhSuspended: selectedDriver.cnhSuspended || false,
        cnhObservation: selectedDriver.cnhObservation || "",
        address: selectedDriver.address || "",
        emergencyContact: selectedDriver.emergencyContact || "",
        photoUrl: selectedDriver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        status: selectedDriver.status || "active",
        birthDate: selectedDriver.birthDate || "",
        civilStatus: selectedDriver.civilStatus || "Solteiro(a)",
        notes: selectedDriver.notes || "",
        admissionDate: selectedDriver.admissionDate || "",
        exitDate: selectedDriver.exitDate || ""
      });
      setDriverLocks(selectedDriver.activeLocks || []);
      setLockJustification(selectedDriver.lockJustification || {});

      if (templates.length > 0) setSelectedTemplateId(templates[0].id);
      const availableVeh = vehicles.filter(
        v => v.status === "active" && !assignments.some(a => a.active && a.vehicleId === v.id)
      );
      if (availableVeh.length > 0) setSimulatedVehicleId(availableVeh[0].id);
    } else {
      setFormData({
        name: "",
        cpf: "",
        rg: "",
        phone: "",
        condutax: "",
        condutaxExpiration: "",
        cnhNumber: "",
        cnhCategory: "AB",
        cnhExpiration: "",
        cnhPoints: 0,
        cnhPointsUpdatedAt: "",
        cnhSuspended: false,
        cnhObservation: "",
        address: "",
        emergencyContact: "",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        status: "active",
        birthDate: "",
        civilStatus: "Solteiro(a)",
        notes: "",
        admissionDate: new Date().toISOString().split("T")[0],
        exitDate: ""
      });
      setDriverLocks([]);
      setLockJustification({});
    }
  }, [selectedDriver, templates, vehicles, assignments]);

  if (!isOpen) return null;

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePersonalData(selectedDriver, formData);
  };

  const handleSaveLocksForm = async () => {
    if (!selectedDriver) return;
    await onSaveLocks(selectedDriver, driverLocks, lockJustification);
  };

  const handleSimulateContractForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    await onSimulateContract(selectedDriver, selectedTemplateId, simulatedVehicleId, simulatedDailyRate);
  };

  const handleAddOccurrenceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    await onAddOccurrence(selectedDriver, occurrenceForm);
    setOccurrenceForm({
      type: "Reclamação",
      description: "",
      reportedBy: ""
    });
  };

  const handleUploadDocForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    await onUploadDoc(selectedDriver, docForm);
    setDocForm({ fileName: "", fileUrl: "" });
  };

  const handleAddLedgerEntryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    await onAddLedgerEntry(selectedDriver, ledgerForm);
    setLedgerForm({ type: "daily", description: "", amount: "" });
  };

  const handleAddInfractionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    await onAddInfraction(selectedDriver, infractionForm);
    setInfractionForm({
      date: new Date().toISOString().split("T")[0],
      ait: "",
      agency: "",
      vehicleId: "",
      points: 0,
      amount: "",
      description: "",
      responsible: "",
      status: "Pendente"
    });
  };

  // Emissão de documentos interpolados
  const handleEmitDocument = (templateId: string) => {
    if (!selectedDriver) return;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const activeAsg = assignments.find(a => a.active && a.driverId === selectedDriver.id);
    const vehicle = activeAsg ? vehicles.find(v => v.id === activeAsg.vehicleId) : null;
    const activeContract = contracts.find(c => c.status === "active" && c.driverId === selectedDriver.id);

    const todayStr = new Date().toLocaleDateString("pt-BR");
    const formattedContent = template.body
      .replace(/{{driver_name}}/g, selectedDriver.name)
      .replace(/{{vehicle_plate}}/g, vehicle ? vehicle.plate : "N/A")
      .replace(/{{daily_rate}}/g, activeContract ? activeContract.dailyRate.toString() : "150")
      .replace(/{{contract_date}}/g, todayStr);

    setEmittedContent(formattedContent);
    setEmissionTemplateId(templateId);
  };

  const handlePrintEmittedDocument = () => {
    if (!selectedDriver) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impressão de Documento | FleetOS</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .content { white-space: pre-wrap; margin-bottom: 50px; font-size: 14px; }
              .signature { margin-top: 60px; display: flex; justify-content: space-between; }
              .sig-line { border-top: 1px solid #111; width: 45%; text-align: center; padding-top: 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>FLEETOS - OPERAÇÃO DE TRANSPORTE E LOGÍSTICA</h2>
              <p>Emissão Digital de Termo / Documento de Frota</p>
            </div>
            <div class="content">${emittedContent}</div>
            <div class="signature">
              <div class="sig-line">FLEETOS REPRESENTAÇÃO LTDA</div>
              <div class="sig-line">${selectedDriver.name.toUpperCase()}</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-background border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center space-x-4">
            <img
              src={formData.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={formData.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-outline"
            />
            <div>
              <h3 className="text-xl font-bold text-primary font-geist flex items-center gap-2">
                <span>{formData.name || "Novo Motorista"}</span>
                {selectedDriver && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      selectedDriver.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                        : "bg-red-500/10 text-red-500 border-red-500/25"
                    }`}
                  >
                    {selectedDriver.status === "active" ? "Ativo" : "Bloqueado"}
                  </span>
                )}
              </h3>
              <p className="text-xs text-on-surface-variant">
                CPF: {formData.cpf || "---.---.------"} • CNH: {formData.cnhNumber || "Não cadastrado"}{" "}
                {formData.cnhNumber && `(${formData.cnhCategory})`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedDriver && (
              <button
                onClick={() => onOpenDossier(selectedDriver)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-primary font-bold hover:bg-surface-container-high transition-all text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Gerar Dossiê Impresso</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Read-only Alert Banner */}
        {selectedDriver && isReadOnly(selectedDriver) && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-xs text-red-600 font-bold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>
              RESTRIÇÃO DE OPERAÇÃO: Este prontuário possui bloqueio administrativo/judicial ativo. As telas estão em
              modo de "Apenas Leitura".
            </span>
          </div>
        )}

        {/* Modal Content layout (Sidebar tabs + content) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-surface-container-low border-r border-outline-variant/60 p-4 space-y-1 overflow-y-auto">
            {[
              { id: "personal", label: "Dados Pessoais", icon: User, requiresDriver: false },
              { id: "locks", label: "Regras & Bloqueios", icon: ShieldAlert, requiresDriver: true },
              { id: "contracts", label: "Contratos & Vínculos", icon: Car, requiresDriver: true },
              { id: "ledger", label: "Conta Corrente", icon: DollarSign, requiresDriver: true },
              { id: "occurrences", label: "Ocorrências Disciplinares", icon: AlertTriangle, requiresDriver: true },
              { id: "infractions", label: "Infrações de Trânsito", icon: FileSpreadsheet, requiresDriver: true },
              { id: "docs", label: "Docs Digitalizados", icon: Paperclip, requiresDriver: true },
              { id: "emission", label: "Emissão de Termos", icon: FileCheck, requiresDriver: true },
              { id: "timeline", label: "Histórico Auditoria", icon: Activity, requiresDriver: true }
            ].map(t => {
              const Icon = t.icon;
              const isLocked = t.requiresDriver && !selectedDriver;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => !isLocked && setActiveTab(t.id)}
                  title={isLocked ? "Salve o cadastro básico primeiro para acessar esta seção" : t.label}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                    isLocked
                      ? "opacity-40 cursor-not-allowed text-on-surface-variant"
                      : activeTab === t.id
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{t.label}</span>
                  {isLocked && <Lock className="w-3 h-3 opacity-60 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto bg-surface-container-lowest text-xs">
            {activeTab !== "personal" && !selectedDriver && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                <div className="w-16 h-16 rounded-full bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center">
                  <Lock className="w-7 h-7 text-outline" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary font-geist">Salve o cadastro básico primeiro</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                    Esta seção estará disponível após salvar os Dados Pessoais do novo motorista.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("personal")}
                  type="button"
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
                >
                  Ir para Dados Pessoais
                </button>
              </div>
            )}

            {/* 1. DADOS PESSOAIS */}
            {activeTab === "personal" && (
              <form onSubmit={handleSavePersonal} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 floating-label-group">
                    <input
                      type="text"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-name"
                      placeholder=" "
                    />
                    <label htmlFor="p-name" className="text-xs font-semibold text-outline">
                      Nome Completo
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="text"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder=" "
                      value={formData.cpf}
                      onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs font-mono"
                      id="p-cpf"
                    />
                    <label htmlFor="p-cpf" className="text-xs font-semibold text-outline">
                      CPF
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="text"
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder=" "
                      value={formData.rg}
                      onChange={e => setFormData({ ...formData, rg: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs font-mono"
                      id="p-rg"
                    />
                    <label htmlFor="p-rg" className="text-xs font-semibold text-outline">
                      RG
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="date"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      value={formData.birthDate}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-birth"
                    />
                    <label htmlFor="p-birth" className="text-xs font-semibold text-outline">
                      Data de Nascimento
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="text"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder=" "
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-phone"
                    />
                    <label htmlFor="p-phone" className="text-xs font-semibold text-outline">
                      Telefone Celular
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <select
                      value={formData.civilStatus}
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      onChange={e => setFormData({ ...formData, civilStatus: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs appearance-none"
                      id="p-civil"
                    >
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                    <label htmlFor="p-civil" className="text-xs font-semibold text-outline">
                      Estado Civil
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="text"
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder=" "
                      value={formData.emergencyContact}
                      onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-emerg"
                    />
                    <label htmlFor="p-emerg" className="text-xs font-semibold text-outline">
                      Contato de Emergência
                    </label>
                  </div>

                  <div className="md:col-span-2 floating-label-group">
                    <input
                      type="text"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder=" "
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-addr"
                    />
                    <label htmlFor="p-addr" className="text-xs font-semibold text-outline">
                      Endereço Completo
                    </label>
                  </div>
                </div>

                {/* Technical Documents Info Card */}
                <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Habilitação & CONDUTAX</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="floating-label-group">
                      <input
                        type="text"
                        required
                        disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                        value={formData.cnhNumber}
                        onChange={e => setFormData({ ...formData, cnhNumber: e.target.value })}
                        className="w-full pl-3 pr-3 text-xs"
                        id="p-cnh"
                        placeholder=" "
                      />
                      <label htmlFor="p-cnh" className="text-xs font-semibold text-outline">
                        Nº CNH (Habilitação)
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="floating-label-group">
                        <select
                          value={formData.cnhCategory}
                          disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                          onChange={e => setFormData({ ...formData, cnhCategory: e.target.value })}
                          className="w-full pl-3 pr-3 text-xs appearance-none"
                          id="p-cnh-cat"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                        <label htmlFor="p-cnh-cat" className="text-xs font-semibold text-outline">
                          Cat CNH
                        </label>
                      </div>

                      <div className="floating-label-group">
                        <input
                          type="date"
                          required
                          disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                          value={formData.cnhExpiration}
                          onChange={e => setFormData({ ...formData, cnhExpiration: e.target.value })}
                          className="w-full pl-3 pr-3 text-xs text-primary"
                          id="p-cnh-exp"
                        />
                        <label htmlFor="p-cnh-exp" className="text-xs font-semibold text-outline">
                          Validade CNH
                        </label>
                      </div>
                    </div>

                    <div className="floating-label-group">
                      <input
                        type="text"
                        disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                        value={formData.condutax}
                        onChange={e => setFormData({ ...formData, condutax: e.target.value })}
                        className="w-full pl-3 pr-3 text-xs"
                        id="p-cond"
                        placeholder=" "
                      />
                      <label htmlFor="p-cond" className="text-xs font-semibold text-outline">
                        CONDUTAX
                      </label>
                    </div>

                    <div className="floating-label-group">
                      <input
                        type="date"
                        disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                        value={formData.condutaxExpiration}
                        onChange={e => setFormData({ ...formData, condutaxExpiration: e.target.value })}
                        className="w-full pl-3 pr-3 text-xs text-primary"
                        id="p-cond-exp"
                      />
                      <label htmlFor="p-cond-exp" className="text-xs font-semibold text-outline">
                        Validade CONDUTAX
                      </label>
                    </div>
                  </div>

                  {/* CNH Scoring Card */}
                  {(() => {
                    const cnhSt = getCNHStatus(formData.cnhPoints);
                    return (
                      <div className={`rounded-xl border p-4 space-y-3 ${cnhSt.bg} ${cnhSt.border}`}>
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold uppercase tracking-wider ${cnhSt.text}`}>
                            Pontuação CNH — Status: {cnhSt.label}
                          </h5>
                          <span className={`text-2xl font-black font-mono ${cnhSt.text}`}>{formData.cnhPoints} pts</span>
                        </div>
                        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              formData.cnhPoints <= 19
                                ? "bg-emerald-500"
                                : formData.cnhPoints <= 29
                                ? "bg-yellow-400"
                                : formData.cnhPoints <= 39
                                ? "bg-orange-500"
                                : "bg-red-600"
                            }`}
                            style={{ width: `${Math.min(100, (formData.cnhPoints / 40) * 100)}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">
                              Pontuação Atual
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                              value={formData.cnhPoints}
                              onChange={e => setFormData({ ...formData, cnhPoints: Number(e.target.value) })}
                              className={`w-full px-3 py-1.5 bg-white/70 border rounded text-xs font-mono font-bold outline-none ${cnhSt.border}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">
                              Última Consulta Detran
                            </label>
                            <input
                              type="date"
                              disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                              value={formData.cnhPointsUpdatedAt}
                              onChange={e => setFormData({ ...formData, cnhPointsUpdatedAt: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white/70 border border-outline-variant rounded text-xs outline-none"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.cnhSuspended}
                            disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                            onChange={e => setFormData({ ...formData, cnhSuspended: e.target.checked })}
                            className="w-4 h-4 accent-red-600"
                          />
                          <span className="text-xs font-bold text-red-700">CNH Suspensa / Cassada</span>
                        </label>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-outline mb-1">Observação</label>
                          <input
                            type="text"
                            disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                            placeholder="Ex: Recurso em andamento, suspensão preventiva..."
                            value={formData.cnhObservation}
                            onChange={e => setFormData({ ...formData, cnhObservation: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white/70 border border-outline-variant rounded text-xs outline-none"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="floating-label-group">
                    <input
                      type="date"
                      required
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      value={formData.admissionDate}
                      onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-adm"
                    />
                    <label htmlFor="p-adm" className="text-xs font-semibold text-outline">
                      Data de Admissão
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="date"
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      value={formData.exitDate}
                      onChange={e => setFormData({ ...formData, exitDate: e.target.value })}
                      className="w-full pl-3 pr-3 text-xs"
                      id="p-exit"
                    />
                    <label htmlFor="p-exit" className="text-xs font-semibold text-outline">
                      Data de Saída
                    </label>
                  </div>

                  <div className="md:col-span-2 floating-label-group">
                    <textarea
                      rows={3}
                      disabled={selectedDriver ? isReadOnly(selectedDriver) : false}
                      placeholder="Notas do dossiê operacional, observações de seguro..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full pl-3 pr-3 pt-3 text-xs bg-surface-container-low border border-outline-variant rounded"
                    />
                  </div>
                </div>

                {(!selectedDriver || !isReadOnly(selectedDriver)) && (
                  <div className="flex justify-end pt-3">
                    <button type="submit" className="px-6 py-2 rounded bg-primary text-on-primary font-bold text-xs">
                      Salvar Dados Cadastrais
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* 2. REGRAS & BLOQUEIOS */}
            {activeTab === "locks" && selectedDriver && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-primary font-geist mb-2 uppercase text-xs tracking-wider">
                    Editor de Trava Reguladora e Bloqueios
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Selecione quais bloqueios regulatórios e regras operacionais bloquearão a assinatura eletrônica de
                    novos contratos e a locação de veículos.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "Documentação",
                      desc: "CNH Vencida, CONDUTAX Vencido ou Ficha Cadastral pendente."
                    },
                    {
                      id: "Financeiro",
                      desc: "Inadimplência de Diárias, acordos não cumpridos ou saldo negativo crítico."
                    },
                    {
                      id: "Conduta",
                      desc: "Reclamações graves de passageiros, acidentes reincidentes ou desvio de rota."
                    },
                    {
                      id: "Administrativo",
                      desc: "Bloqueio preventivo solicitado pela gestão da frota."
                    },
                    {
                      id: "Judicial",
                      desc: "Restrição determinada por mandado ou processo judicial em andamento."
                    }
                  ].map(l => {
                    const isChecked = driverLocks.includes(l.id);
                    return (
                      <div key={l.id} className="bg-slate-50 border border-outline-variant p-4 rounded-xl space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isReadOnly(selectedDriver) && !can("users.manage")}
                            onChange={e => {
                              if (e.target.checked) {
                                setDriverLocks([...driverLocks, l.id]);
                              } else {
                                setDriverLocks(driverLocks.filter(item => item !== l.id));
                              }
                            }}
                            className="w-4 h-4 accent-red-650 mt-0.5"
                          />
                          <div>
                            <span className="font-bold text-primary text-xs">{l.id}</span>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{l.desc}</p>
                          </div>
                        </label>

                        {isChecked && (
                          <div className="pl-7">
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">
                              Justificativa do Bloqueio
                            </label>
                            <input
                              type="text"
                              required
                              disabled={isReadOnly(selectedDriver) && !can("users.manage")}
                              placeholder="Digite a justificativa operacional..."
                              value={lockJustification[l.id] || ""}
                              onChange={e =>
                                setLockJustification({
                                  ...lockJustification,
                                  [l.id]: e.target.value
                                })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none focus:border-red-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleSaveLocksForm}
                    type="button"
                    className="px-6 py-2 rounded bg-red-600 text-white font-bold text-xs"
                  >
                    Confirmar Regras de Bloqueio
                  </button>
                </div>
              </div>
            )}

            {/* 3. CONTRATOS & VÍNCULOS */}
            {activeTab === "contracts" && selectedDriver && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Vínculo Ativo Atual</h4>
                  {assignments.some(a => a.active && a.driverId === selectedDriver.id) ? (
                    assignments
                      .filter(a => a.active && a.driverId === selectedDriver.id)
                      .map(a => {
                        const veh = vehicles.find(v => v.id === a.vehicleId);
                        return (
                          <div
                            key={a.id}
                            className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 p-4 rounded-xl flex justify-between items-center text-xs"
                          >
                            <div>
                              <p className="font-bold text-emerald-900">Veículo Vinculado Ativo</p>
                              <p className="text-on-surface-variant font-mono mt-1">
                                {veh
                                  ? `${veh.brand} ${veh.model} (${veh.plate}) - Odo: ${veh.mileage}km`
                                  : `ID Veículo: ${a.vehicleId}`}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Início do vínculo: {new Date(a.startDate).toLocaleString()}
                              </p>
                            </div>
                            <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              Ativo
                            </span>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
                      Nenhum veículo vinculado ativamente a este prontuário.
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                    Histórico de Contratos de Locação
                  </h4>
                  <div className="overflow-x-auto border border-outline-variant rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-outline-variant">
                        <tr className="font-bold text-on-surface-variant">
                          <th className="p-3">Veículo</th>
                          <th className="p-3">Início</th>
                          <th className="p-3">Término</th>
                          <th className="p-3 text-right">Taxa Diária</th>
                          <th className="p-3 text-right">Total Pago</th>
                          <th className="p-3 text-center">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.filter(c => c.driverId === selectedDriver.id).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center italic text-on-surface-variant">
                              Nenhum contrato formal de locação no histórico.
                            </td>
                          </tr>
                        ) : (
                          contracts
                            .filter(c => c.driverId === selectedDriver.id)
                            .slice()
                            .reverse()
                            .map(c => {
                              const veh = vehicles.find(v => v.id === c.vehicleId);
                              return (
                                <tr key={c.id} className="border-t border-outline-variant/60">
                                  <td className="p-3 font-semibold">
                                    {veh
                                      ? `${veh.brand} (${veh.plate})`
                                      : `Veículo (${c.vehicleId.substr(0, 6)})`}
                                  </td>
                                  <td className="p-3 font-mono">{new Date(c.startDate).toLocaleDateString("pt-BR")}</td>
                                  <td className="p-3 font-mono">
                                    {c.endDate ? new Date(c.endDate).toLocaleDateString("pt-BR") : "-"}
                                  </td>
                                  <td className="p-3 text-right font-mono font-semibold">R$ {c.dailyRate}</td>
                                  <td className="p-3 text-right font-mono text-emerald-600 font-bold">
                                    R$ {c.amountPaid || 0}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                        c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {c.status === "active" ? "Vigente" : "Encerrado"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!isReadOnly(selectedDriver) && (
                  <div className="bg-slate-50 border border-outline-variant/80 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <span>Simular e Assinar Novo Contrato de Locação</span>
                    </h4>

                    {selectedDriver.activeLocks && selectedDriver.activeLocks.includes("Documentação") && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-xs font-bold">
                        ⚠️ Assinatura Eletrônica Bloqueada: O motorista possui uma trava ativa de "Documentação".
                        Regularize a CNH/CONDUTAX antes de assinar.
                      </div>
                    )}

                    <form onSubmit={handleSimulateContractForm} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Modelo de Contrato
                        </label>
                        <select
                          value={selectedTemplateId}
                          onChange={e => setSelectedTemplateId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                        >
                          <option value="">Selecione...</option>
                          {templates
                            .filter(t => t.active)
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Veículo Disponível
                        </label>
                        <select
                          value={simulatedVehicleId}
                          onChange={e => setSimulatedVehicleId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                        >
                          <option value="">Selecione...</option>
                          {vehicles
                            .filter(v => v.status === "active" && !assignments.some(a => a.active && a.vehicleId === v.id))
                            .map(v => (
                              <option key={v.id} value={v.id}>
                                {v.plate} - {v.brand} {v.model}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Taxa Diária (R$)
                        </label>
                        <input
                          type="number"
                          value={simulatedDailyRate}
                          onChange={e => setSimulatedDailyRate(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            (selectedDriver.activeLocks && selectedDriver.activeLocks.includes("Documentação")) ||
                            !simulatedVehicleId ||
                            !selectedTemplateId
                          }
                          className={`px-5 py-2.5 rounded font-bold text-xs ${
                            (selectedDriver.activeLocks && selectedDriver.activeLocks.includes("Documentação")) ||
                            !simulatedVehicleId ||
                            !selectedTemplateId
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-primary text-on-primary hover:opacity-90"
                          }`}
                        >
                          Assinar e Vincular Veículo
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 4. CONTA CORRENTE */}
            {activeTab === "ledger" && selectedDriver && (
              <div className="space-y-6">
                <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl flex justify-between items-center font-geist">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-outline">Saldo Acumulado da Conta Gráfica</p>
                    <h2
                      className={`text-2xl font-extrabold font-mono mt-1 ${
                        getDriverBalance(selectedDriver.id) >= 0 ? "text-emerald-600" : "text-error"
                      }`}
                    >
                      R$ {getDriverBalance(selectedDriver.id).toFixed(2)}
                    </h2>
                  </div>
                  <span className="material-symbols-outlined text-[36px] text-outline opacity-40">
                    account_balance_wallet
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                    Extrato Completo de Lançamentos
                  </h4>
                  <div className="overflow-x-auto border border-outline-variant rounded-xl max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-outline-variant sticky top-0">
                        <tr className="font-bold text-on-surface-variant">
                          <th className="p-3">Data Lançamento</th>
                          <th className="p-3">Tipo</th>
                          <th className="p-3">Descrição</th>
                          <th className="p-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/60 font-mono">
                        {ledger.filter(l => l.driverId === selectedDriver.id).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center italic font-sans text-on-surface-variant">
                              Nenhum lançamento no extrato financeiro.
                            </td>
                          </tr>
                        ) : (
                          ledger
                            .filter(l => l.driverId === selectedDriver.id)
                            .slice()
                            .reverse()
                            .map(l => (
                              <tr key={l.id} className="hover:bg-slate-50/40">
                                <td className="p-3 text-on-surface-variant">
                                  {new Date(l.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3 uppercase font-bold text-[10px] font-sans">{l.type}</td>
                                <td className="p-3 font-sans text-primary">{l.description}</td>
                                <td
                                  className={`p-3 text-right font-bold ${
                                    l.amount >= 0 ? "text-emerald-600" : "text-error"
                                  }`}
                                >
                                  R$ {l.amount.toFixed(2)}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!isReadOnly(selectedDriver) && (
                  <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <span>Lançamento Manual na Conta Corrente</span>
                    </h4>

                    <form onSubmit={handleAddLedgerEntryForm} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Tipo do Lançamento
                        </label>
                        <select
                          value={ledgerForm.type}
                          onChange={e => setLedgerForm({ ...ledgerForm, type: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none font-sans"
                        >
                          <option value="daily">Diária (Débito)</option>
                          <option value="fine">Multa de Trânsito (Débito)</option>
                          <option value="bonus">Abono / Bonificação (Crédito)</option>
                          <option value="payment">Pagamento Pix/Dinheiro (Crédito)</option>
                          <option value="adjustment">Ajuste de Saldo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Descrição</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Cobrança diária veículo ABC-1234"
                          value={ledgerForm.description}
                          onChange={e => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Valor (R$)</label>
                        <input
                          type="number"
                          required
                          placeholder="0.00"
                          value={ledgerForm.amount}
                          onChange={e => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3 flex justify-end">
                        <button type="submit" className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs">
                          Efetivar Lançamento
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 5. OCORRÊNCIAS */}
            {activeTab === "occurrences" && selectedDriver && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                    Registro de Conduta & Histórico Disciplinar
                  </h4>
                  <div className="space-y-3">
                    {occurrences.filter(o => o.driverId === selectedDriver.id).length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
                        Nenhuma ocorrência disciplinar anotada neste prontuário.
                      </p>
                    ) : (
                      occurrences
                        .filter(o => o.driverId === selectedDriver.id)
                        .slice()
                        .reverse()
                        .map(o => (
                          <div
                            key={o.id}
                            className="bg-slate-50 border border-outline-variant p-4 rounded-xl flex justify-between items-start text-xs"
                          >
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                  o.type === "Elogio" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {o.type}
                              </span>
                              <p className="text-primary font-medium">{o.description}</p>
                              <p className="text-[10px] text-on-surface-variant font-mono">
                                Reportado por: {o.reportedBy} • em {new Date(o.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {!isReadOnly(selectedDriver) && (
                  <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <span>Lançar Nova Ocorrência / Advertência</span>
                    </h4>

                    <form onSubmit={handleAddOccurrenceForm} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                            Classificação
                          </label>
                          <select
                            value={occurrenceForm.type}
                            onChange={e => setOccurrenceForm({ ...occurrenceForm, type: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none appearance-none"
                          >
                            <option value="Reclamação">Reclamação de Cliente</option>
                            <option value="Ocorrência Operacional">Ocorrência Operacional</option>
                            <option value="Advertência">Advertência Formal</option>
                            <option value="Suspensão">Suspensão de Contrato</option>
                            <option value="Elogio">Elogio / Nota de Conduta</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Descrição Detalhada do Fato
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Descrever a conduta, com datas, locais, testemunhas ou referências..."
                          value={occurrenceForm.description}
                          onChange={e => setOccurrenceForm({ ...occurrenceForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-outline-variant rounded text-xs outline-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button type="submit" className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs">
                          Registrar Ocorrência
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 6. DOCS DIGITALIZADOS */}
            {activeTab === "docs" && selectedDriver && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                    Arquivos e Anexos Digitais
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.filter(a => a.entityType === "driver" && a.entityId === selectedDriver.id).length ===
                    0 ? (
                      <p className="col-span-2 text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
                        Nenhum arquivo digitalizado anexado a este prontuário.
                      </p>
                    ) : (
                      attachments
                        .filter(a => a.entityType === "driver" && a.entityId === selectedDriver.id)
                        .map(a => (
                          <div
                            key={a.id}
                            className="bg-slate-50 border border-outline-variant p-3 rounded-xl flex justify-between items-center text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <Paperclip className="w-4 h-4 text-outline" />
                              <div>
                                <a
                                  href={a.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-primary hover:underline"
                                >
                                  {a.fileName}
                                </a>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">
                                  Por: {a.uploadedBy || "Sistema"}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-outline font-mono">PDF / Imagem</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {!isReadOnly(selectedDriver) && (
                  <div className="bg-slate-50 border border-outline-variant rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-primary" />
                      <span>Anexar Novo Documento Digitalizado</span>
                    </h4>

                    <form onSubmit={handleUploadDocForm} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          Identificação do Arquivo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Comprovante_Residencia.pdf"
                          value={docForm.fileName}
                          onChange={e => setDocForm({ ...docForm, fileName: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">
                          URL Mock / Arquivo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="https://example.com/doc.pdf"
                          value={docForm.fileUrl}
                          onChange={e => setDocForm({ ...docForm, fileUrl: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end">
                        <button type="submit" className="px-5 py-2 rounded bg-primary text-on-primary font-bold text-xs">
                          Fazer Upload Mock
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 7. EMISSÃO DE TEMPLATES */}
            {activeTab === "emission" && selectedDriver && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-primary font-geist mb-1 uppercase text-xs tracking-wider">
                    Impressão e Emissão de Termos de Frota
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Escolha um modelo corporativo para emitir um PDF assinado ou impresso preenchendo automaticamente as
                    variáveis do motorista e veículo ativo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleEmitDocument(t.id)}
                      className={`p-3 rounded-lg border text-left space-y-1 font-semibold transition-all ${
                        emissionTemplateId === t.id
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-slate-50 border-outline-variant hover:bg-slate-100 text-primary"
                      }`}
                    >
                      <FileText className="w-4 h-4 mb-1" />
                      <span className="block text-xs">{t.name}</span>
                      <span className="block text-[9px] text-outline font-normal">Placeholder Interpolado</span>
                    </button>
                  ))}
                </div>

                {emittedContent && (
                  <div className="bg-white border-2 border-slate-900 rounded-xl p-6 space-y-4 text-slate-800">
                    <div className="flex justify-between items-center border-b pb-3 border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase">Visualização da Emissão Digital</span>
                      <button
                        type="button"
                        onClick={handlePrintEmittedDocument}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Termo</span>
                      </button>
                    </div>

                    <div className="font-sans text-xs whitespace-pre-wrap leading-relaxed border p-4 bg-slate-50 rounded font-mono">
                      {emittedContent}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. INFRAÇÕES DE TRÂNSITO */}
            {activeTab === "infractions" && selectedDriver && (() => {
              const drvInfractions = infractions.filter(i => i.driverId === selectedDriver.id);
              const totalPoints = drvInfractions.reduce((acc, i) => acc + (i.points || 0), 0);
              const totalFines = drvInfractions.reduce((acc, i) => acc + (i.amount || 0), 0);
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-outline-variant rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold uppercase text-outline">Total Infrações</p>
                      <p className="text-xl font-black text-primary font-mono">{drvInfractions.length}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center border ${getCNHStatus(totalPoints).bg} ${getCNHStatus(totalPoints).border}`}>
                      <p className="text-[9px] font-bold uppercase text-outline">Pontos Acumulados</p>
                      <p className={`text-xl font-black font-mono ${getCNHStatus(totalPoints).text}`}>{totalPoints} pts</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold uppercase text-outline">Total em Multas</p>
                      <p className="text-xl font-black text-red-600 font-mono">R$ {totalFines.toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Histórico de Infrações</h4>
                    {drvInfractions.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
                        Nenhuma infração registrada neste prontuário.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-outline-variant">
                            <tr className="text-on-surface-variant font-semibold text-[10px] uppercase">
                              <th className="p-2">Data</th>
                              <th className="p-2">Infração</th>
                              <th className="p-2">AIT</th>
                              <th className="p-2">Órgão</th>
                              <th className="p-2 text-center">Pts</th>
                              <th className="p-2 text-right">Valor</th>
                              <th className="p-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/60">
                            {drvInfractions.slice().reverse().map((inf: any) => (
                              <tr key={inf.id} className="hover:bg-slate-50/50">
                                <td className="p-2 font-mono text-[10px]">{new Date(inf.date).toLocaleDateString("pt-BR")}</td>
                                <td className="p-2 font-medium">{inf.description}</td>
                                <td className="p-2 font-mono text-[10px]">{inf.ait || "—"}</td>
                                <td className="p-2 text-[10px]">{inf.agency || "—"}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${getCNHStatus(inf.points).bg} ${getCNHStatus(inf.points).text}`}>
                                    {inf.points}
                                  </span>
                                </td>
                                <td className="p-2 text-right font-mono font-semibold text-red-600">R$ {Number(inf.amount).toFixed(2)}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    inf.status === "Pago" ? "bg-emerald-100 text-emerald-700" :
                                    inf.status === "Recorrendo" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-slate-100 text-slate-600"
                                  }`}>{inf.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {!isReadOnly(selectedDriver) && (
                    <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <FilePlus className="w-4 h-4" />
                        <span>Registrar Nova Infração</span>
                      </h4>
                      <form onSubmit={handleAddInfractionForm} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Data da Infração</label>
                            <input type="date" required value={infractionForm.date}
                              onChange={e => setInfractionForm({...infractionForm, date: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Nº AIT</label>
                            <input type="text" placeholder="Ex: 000-001234" value={infractionForm.ait}
                              onChange={e => setInfractionForm({...infractionForm, ait: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Descrição da Infração *</label>
                            <input type="text" required placeholder="Ex: Excesso de velocidade — 80km/h em faixa de 60km/h" value={infractionForm.description}
                              onChange={e => setInfractionForm({...infractionForm, description: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Órgão Autuador</label>
                            <input type="text" placeholder="Ex: DETRAN, CET, PRF" value={infractionForm.agency}
                              onChange={e => setInfractionForm({...infractionForm, agency: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Veículo</label>
                            <select value={infractionForm.vehicleId}
                              onChange={e => setInfractionForm({...infractionForm, vehicleId: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none font-sans"
                            >
                              <option value="">Selecione...</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Pontuação CNH *</label>
                            <select required value={infractionForm.points}
                              onChange={e => setInfractionForm({...infractionForm, points: Number(e.target.value)})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none font-sans"
                            >
                              <option value={0}>0 pts</option>
                              <option value={3}>3 pts — Leve</option>
                              <option value={4}>4 pts — Média</option>
                              <option value={5}>5 pts — Grave</option>
                              <option value={7}>7 pts — Gravíssima</option>
                              <option value={10}>10 pts — Gravíssima (Especial)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Valor da Multa (R$) *</label>
                            <input type="number" required min={0} step={0.01} placeholder="0.00" value={infractionForm.amount}
                              onChange={e => setInfractionForm({...infractionForm, amount: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs font-mono outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Status</label>
                            <select value={infractionForm.status}
                              onChange={e => setInfractionForm({...infractionForm, status: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none appearance-none font-sans"
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Pago">Pago</option>
                              <option value="Recorrendo">Recorrendo</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-outline mb-1">Responsável</label>
                            <input type="text" placeholder={currentUser?.displayName || "Operador"} value={infractionForm.responsible}
                              onChange={e => setInfractionForm({...infractionForm, responsible: e.target.value})}
                              className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-xs outline-none font-sans"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button type="submit" className="px-5 py-2 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors">
                            Registrar Infração e Atualizar Pontuação CNH
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 9. LINHA DO TEMPO */}
            {activeTab === "timeline" && selectedDriver && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Linha do Tempo de Atividades</h4>
                <div className="space-y-4">
                  {timeline.filter(t => t.entityType === "driver" && t.entityId === selectedDriver.id).length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic bg-slate-50 p-4 border border-outline-variant rounded-xl">
                      Nenhum evento registrado na auditoria deste prontuário.
                    </p>
                  ) : (
                    timeline
                      .filter(t => t.entityType === "driver" && t.entityId === selectedDriver.id)
                      .slice()
                      .reverse()
                      .map(t => (
                        <div key={t.id} className="relative pl-6 border-l border-outline-variant py-2 text-xs">
                          <span className="absolute -left-1.5 top-3.5 w-3 h-3 rounded-full bg-primary border border-outline-variant" />
                          <div>
                            <p className="font-bold text-primary">{t.title}</p>
                            <p className="text-on-surface-variant mt-0.5">{t.description}</p>
                            <div className="flex items-center space-x-2 mt-1 text-[10px] text-outline font-mono">
                              <span>{new Date(t.createdAt).toLocaleString()}</span>
                              <span>•</span>
                              <span>Operador: {t.createdBy}</span>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant font-semibold text-xs"
          >
            Fechar Prontuário
          </button>
        </div>
      </div>
    </div>
  );
}
