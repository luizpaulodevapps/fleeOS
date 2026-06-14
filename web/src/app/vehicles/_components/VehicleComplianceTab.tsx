"use client";

import React, { useState, useEffect } from "react";
import { 
  Scale, ShieldCheck, ShieldAlert, Wrench, AlertTriangle, 
  CheckCircle2, XCircle, Plus, Trash2, Calendar, FileText, 
  Flame, Gauge, RefreshCw, ClipboardList, Info, Printer, Download,
  User, Settings
} from "lucide-react";
import { 
  VehicleRegulatoryProcess, RegulatoryInspection, 
  TaximeterRegistry, MunicipalRegulation,
  AlvaraDetails, CompanyDetails
} from "../_lib/types";

interface VehicleComplianceTabProps {
  selectedVehicle: any;
  regulatoryProcesses: VehicleRegulatoryProcess[];
  regulatoryInspections: RegulatoryInspection[];
  taximeterRegistries: TaximeterRegistry[];
  municipalRegulations: MunicipalRegulation[];
  handleSaveRegulatoryProcess: (vehicleId: string, data: any) => Promise<void>;
  handleSaveTaximeterRegistry: (vehicleId: string, data: any) => Promise<void>;
  handleSaveRegulatoryInspection: (vehicleId: string, data: any) => Promise<void>;
  handleDeleteRegulatoryInspection: (inspectionId: string) => Promise<void>;
  isReadOnly: (vehicle: any) => boolean;
  drivers: any[];
  assignments: any[];
  contracts: any[];
}

export function VehicleComplianceTab({
  selectedVehicle,
  regulatoryProcesses,
  regulatoryInspections,
  taximeterRegistries,
  municipalRegulations,
  handleSaveRegulatoryProcess,
  handleSaveTaximeterRegistry,
  handleSaveRegulatoryInspection,
  handleDeleteRegulatoryInspection,
  isReadOnly,
  drivers,
  assignments,
  contracts
}: VehicleComplianceTabProps) {
  const readOnly = isReadOnly(selectedVehicle);
  const vehicleId = selectedVehicle.id;

  // Retrieve current process or init default
  const currentProcess: VehicleRegulatoryProcess = regulatoryProcesses.find(rp => rp.vehicleId === vehicleId) || {
    vehicleId,
    city: "São Paulo",
    operationType: "taxi",
    status: selectedVehicle.status || "active",
    checklist: {
      invoice: false,
      crv: false,
      renavam: false,
      taximeterInstalled: false,
      taximeterCalibrated: false,
      permitIssued: false,
      insuranceActive: false,
      trackerInstalled: false,
      dtpInspectionApproved: false
    },
    gnvDetails: {
      hasGnv: false,
      cylinderSerial: "",
      cylinderManufacturer: "",
      cylinderCapacity: "",
      cylinderMfgDate: "",
      cylinderInstallDate: "",
      cylinderLastInspection: "",
      cylinderExpiry: ""
    },
    decommissioningChecklist: {
      contractClosed: false,
      taximeterRemoved: false,
      permitCancelled: false,
      dtpUpdated: false,
      finesPaid: false,
      debtsPaid: false,
      docsReleased: false
    }
  };

  // State copies for editing
  const [city, setCity] = useState(currentProcess.city);
  const [operationType, setOperationType] = useState(currentProcess.operationType);
  const [status, setStatus] = useState(currentProcess.status);
  const [checklist, setChecklist] = useState({ ...currentProcess.checklist });
  const [gnvDetails, setGnvDetails] = useState({ ...currentProcess.gnvDetails });
  const [decommissioningChecklist, setDecommissioningChecklist] = useState(
    currentProcess.decommissioningChecklist || {
      contractClosed: false,
      taximeterRemoved: false,
      permitCancelled: false,
      dtpUpdated: false,
      finesPaid: false,
      debtsPaid: false,
      docsReleased: false
    }
  );

  // Alvará Details State
  const [alvaraDetails, setAlvaraDetails] = useState<AlvaraDetails>({
    alvaraNumber: currentProcess.alvaraDetails?.alvaraNumber || "",
    validUntil: currentProcess.alvaraDetails?.validUntil || "",
    holderName: currentProcess.alvaraDetails?.holderName || "",
    cnhCategory: currentProcess.alvaraDetails?.cnhCategory || "",
    address: currentProcess.alvaraDetails?.address || "",
    condutax: currentProcess.alvaraDetails?.condutax || "",
    authorizedDriver2: currentProcess.alvaraDetails?.authorizedDriver2 || "",
    parkingStation: currentProcess.alvaraDetails?.parkingStation || "",
    taxExemption: currentProcess.alvaraDetails?.taxExemption || "Isento de IPI e ICMS",
    publicity: currentProcess.alvaraDetails?.publicity || "Autorizada nos Vidros",
    issueDate: currentProcess.alvaraDetails?.issueDate || "",
    formNumber: currentProcess.alvaraDetails?.formNumber || "",
    smtObservation: currentProcess.alvaraDetails?.smtObservation || "Reclamações: Ligue 156. Mantenha a filipeta visível.",
    digitalCopyUrl: currentProcess.alvaraDetails?.digitalCopyUrl || ""
  });

  // Company Details (Defaulted to frota profile but editable)
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    companyName: currentProcess.companyDetails?.companyName || "Táxi Amarelo S.A.",
    cnpj: currentProcess.companyDetails?.cnpj || "12.345.678/0001-90",
    dtpRegistration: currentProcess.companyDetails?.dtpRegistration || "DTP-SP-98712-A",
    radioTaxiName: currentProcess.companyDetails?.radioTaxiName || "Central Ligue-Táxi Amarelo",
    radioTaxiLogoUrl: currentProcess.companyDetails?.radioTaxiLogoUrl || "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=100"
  });

  // Retrieve taxímetro or init default
  const currentTaximeter = taximeterRegistries.find(t => t.vehicleId === vehicleId) || {
    vehicleId,
    brand: "",
    model: "",
    serialNumber: "",
    ipemSeal: "",
    calibrationDate: "",
    validUntil: "",
    history: []
  };

  const [taximeter, setTaximeter] = useState({ ...currentTaximeter });
  const [newHistory, setNewHistory] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "calibration" as any,
    description: ""
  });

  // Regulatory inspections filter
  const vehicleInspections = regulatoryInspections.filter(ri => ri.vehicleId === vehicleId);
  const [newInspection, setNewInspection] = useState({
    type: "alvara" as any,
    validUntil: "",
    lastInspectionDate: "",
    status: "valid" as any,
    notes: ""
  });

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState<"checklist_gnv" | "alvara" | "filipeta">("checklist_gnv");

  // Preposto Driver State (for Filipeta Vínculo generation)
  const activeAssignment = assignments.find(a => a.active && a.vehicleId === vehicleId);
  const activeDriver = activeAssignment ? drivers.find(d => d.id === activeAssignment.driverId) : null;

  const [selectedDriverId, setSelectedDriverId] = useState(activeDriver?.id || "");
  const [filipetaDriver, setFilipetaDriver] = useState({
    name: activeDriver?.name || "",
    condutax: activeDriver?.condutax || "",
    photoUrl: activeDriver?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  });

  // Sync state if selection changes
  useEffect(() => {
    if (currentProcess) {
      setCity(currentProcess.city);
      setOperationType(currentProcess.operationType);
      setStatus(currentProcess.status || selectedVehicle.status);
      setChecklist({ ...currentProcess.checklist });
      setGnvDetails({ ...currentProcess.gnvDetails });
      if (currentProcess.decommissioningChecklist) {
        setDecommissioningChecklist({ ...currentProcess.decommissioningChecklist });
      }
      if (currentProcess.alvaraDetails) {
        setAlvaraDetails({
          alvaraNumber: currentProcess.alvaraDetails.alvaraNumber || "",
          validUntil: currentProcess.alvaraDetails.validUntil || "",
          holderName: currentProcess.alvaraDetails.holderName || "",
          cnhCategory: currentProcess.alvaraDetails.cnhCategory || "",
          address: currentProcess.alvaraDetails.address || "",
          condutax: currentProcess.alvaraDetails.condutax || "",
          authorizedDriver2: currentProcess.alvaraDetails.authorizedDriver2 || "",
          parkingStation: currentProcess.alvaraDetails.parkingStation || "",
          taxExemption: currentProcess.alvaraDetails.taxExemption || "Isento de IPI e ICMS",
          publicity: currentProcess.alvaraDetails.publicity || "Autorizada nos Vidros",
          issueDate: currentProcess.alvaraDetails.issueDate || "",
          formNumber: currentProcess.alvaraDetails.formNumber || "",
          smtObservation: currentProcess.alvaraDetails.smtObservation || "Reclamações: Ligue 156. Mantenha a filipeta visível.",
          digitalCopyUrl: currentProcess.alvaraDetails.digitalCopyUrl || ""
        });
      }
      if (currentProcess.companyDetails) {
        setCompanyDetails({
          companyName: currentProcess.companyDetails.companyName || "Táxi Amarelo S.A.",
          cnpj: currentProcess.companyDetails.cnpj || "12.345.678/0001-90",
          dtpRegistration: currentProcess.companyDetails.dtpRegistration || "DTP-SP-98712-A",
          radioTaxiName: currentProcess.companyDetails.radioTaxiName || "Central Ligue-Táxi Amarelo",
          radioTaxiLogoUrl: currentProcess.companyDetails.radioTaxiLogoUrl || "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=100"
        });
      }
    }
    if (currentTaximeter) {
      setTaximeter({ ...currentTaximeter });
    }
  }, [selectedVehicle.id, regulatoryProcesses, taximeterRegistries]);

  // Sync filipeta selection to driver properties
  useEffect(() => {
    const drv = drivers.find(d => d.id === selectedDriverId);
    if (drv) {
      setFilipetaDriver({
        name: drv.name,
        condutax: drv.condutax || "",
        photoUrl: drv.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
      });
    } else if (activeDriver) {
      setFilipetaDriver({
        name: activeDriver.name,
        condutax: activeDriver.condutax || "",
        photoUrl: activeDriver.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
      });
      setSelectedDriverId(activeDriver.id);
    }
  }, [selectedDriverId, activeDriver, drivers]);

  // Identify applicable regulations
  const activeRegulation = municipalRegulations.find(r => r.city === city) || {
    city,
    requiresTaxiMeter: true,
    requiresPermitInspection: true,
    requiresGnvInspection: true
  };

  // Determine checklist requirements dynamically based on City & Operation Type
  const isTaxi = operationType === "taxi";
  const needsTaximeter = isTaxi && activeRegulation.requiresTaxiMeter;
  const needsDtp = isTaxi && activeRegulation.requiresPermitInspection;
  const needsGnv = gnvDetails.hasGnv && activeRegulation.requiresGnvInspection;

  // Validation Check: determine if vehicle is fully compliant/locatable
  const getPendingChecklistItems = () => {
    const pendings: string[] = [];
    if (!checklist.invoice) pendings.push("Nota Fiscal");
    if (!checklist.crv) pendings.push("CRV");
    if (!checklist.renavam) pendings.push("Renavam");
    if (!checklist.insuranceActive) pendings.push("Seguro Ativo");
    if (!checklist.trackerInstalled) pendings.push("Rastreador Instalado");

    if (needsTaximeter) {
      if (!checklist.taximeterInstalled) pendings.push("Taxímetro instalado");
      if (!checklist.taximeterCalibrated) pendings.push("Taxímetro aferido");
    }
    if (isTaxi) {
      if (!checklist.permitIssued) pendings.push("Alvará emitido");
      if (!alvaraDetails.alvaraNumber) pendings.push("Número do Alvará cadastrado");
      if (!alvaraDetails.validUntil) pendings.push("Validade do Alvará cadastrada");
    }
    if (needsDtp && !checklist.dtpInspectionApproved) pendings.push("Vistoria DTP aprovada");

    return pendings;
  };

  const pendingItems = getPendingChecklistItems();
  const isLocable = pendingItems.length === 0 && status === "active";

  const getGnvExpiryBadge = (expiryStr: string) => {
    if (!expiryStr) return <span className="text-slate-400 text-xs italic">Não informada</span>;
    const expiry = new Date(expiryStr);
    const today = new Date("2026-06-13");
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2.5 py-1 bg-red-100 text-red-750 font-extrabold text-[10px] uppercase rounded-full border border-red-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse" />
          Vencido / Risco Crítico
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="px-2.5 py-1 bg-red-50 text-red-650 font-black text-[10px] uppercase rounded-full border border-red-200 animate-pulse">
          Atenção: Vence em {diffDays} dias
        </span>
      );
    } else if (diffDays <= 60) {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] uppercase rounded-full border border-amber-200">
          Vence em {diffDays} dias
        </span>
      );
    } else if (diffDays <= 90) {
      return (
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase rounded-full border border-blue-200">
          Vence em {diffDays} dias
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase rounded-full border border-emerald-250">
        Regularizado ({diffDays}d)
      </span>
    );
  };

  // Handlers
  const handleSaveProcess = async () => {
    const payload: VehicleRegulatoryProcess = {
      vehicleId,
      city,
      operationType,
      status,
      checklist,
      gnvDetails,
      decommissioningChecklist,
      alvaraDetails,
      companyDetails
    };
    await handleSaveRegulatoryProcess(vehicleId, payload);
    alert("Processo regulatório e documentos salvos com sucesso!");
  };

  const handleSaveTaximeterData = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveTaximeterRegistry(vehicleId, taximeter);
    alert("Registro do taxímetro atualizado!");
  };

  const handleAddTaximeterHistory = async () => {
    if (!newHistory.description) return;
    const updatedHistory = [...(taximeter.history || []), { ...newHistory }];
    const updatedTaximeter = { ...taximeter, history: updatedHistory };
    setTaximeter(updatedTaximeter);
    await handleSaveTaximeterRegistry(vehicleId, updatedTaximeter);
    setNewHistory({
      date: new Date().toISOString().split("T")[0],
      type: "calibration",
      description: ""
    });
    alert("Histórico do taxímetro registrado!");
  };

  const handleAddInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspection.validUntil || !newInspection.lastInspectionDate) {
      alert("Preencha as datas da vistoria.");
      return;
    }
    await handleSaveRegulatoryInspection(vehicleId, newInspection);
    setNewInspection({
      type: "alvara",
      validUntil: "",
      lastInspectionDate: "",
      status: "valid",
      notes: ""
    });
    alert("Vistoria periódica registrada!");
  };

  const isDecommissionComplete = () => {
    const dc = decommissioningChecklist;
    return dc.contractClosed && dc.taximeterRemoved && dc.permitCancelled && 
           dc.dtpUpdated && dc.finesPaid && dc.debtsPaid && dc.docsReleased;
  };

  // Filipeta Printing execution helper
  const handlePrintFilipeta = () => {
    const printContent = document.getElementById("printable-filipeta-container");
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Filipeta - ${selectedVehicle.plate}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: #fff;
            }
            .printable-filipeta {
              width: 320px;
              border: 3px double #b45309;
              padding: 12px;
              background: #fffbef;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              box-sizing: border-box;
            }
            .filipeta-header {
              background: #fef08a;
              border: 1px solid #eab308;
              text-align: center;
              padding: 6px;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 10px;
              border-radius: 6px;
              color: #854d0e;
            }
            .filipeta-content {
              display: grid;
              grid-template-cols: 90px 1fr;
              gap: 10px;
            }
            .photo-box {
              width: 90px;
              height: 120px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background: #f3f4f6;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .photo-box img {
              width: 100%;
              height: 100%;
              object-cover: cover;
            }
            .details-box {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .field {
              border-bottom: 1px solid #f0f0f0;
              padding-bottom: 2px;
            }
            .label {
              font-size: 7px;
              text-transform: uppercase;
              color: #71717a;
              font-weight: 800;
              letter-spacing: 0.02em;
            }
            .value {
              font-size: 9px;
              font-weight: 700;
              color: #18181b;
            }
            .value-mono {
              font-family: monospace;
              font-size: 10px;
            }
            .radio-taxi-section {
              margin-top: 10px;
              border-top: 1px dashed #d1d5db;
              padding-top: 8px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .radio-logo {
              width: 35px;
              height: 25px;
              border-radius: 4px;
              object-fit: contain;
              background: white;
              border: 1px solid #e4e4e7;
            }
            .barcode-sim {
              height: 15px;
              background: linear-gradient(90deg, #000 2px, transparent 2px, #000 4px, transparent 6px, #000 9px, transparent 9px, #000 11px);
              background-size: 15px 100%;
              margin-top: 8px;
              opacity: 0.7;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Compliance Indicator */}
      <div className="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-sm"
        style={{
          borderColor: isLocable ? "#bbf7d0" : "#fecdd3",
          backgroundColor: isLocable ? "#f0fdf4" : "#fff5f5"
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isLocable ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-650"}`}>
            {isLocable ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h4 className={`text-sm font-black uppercase tracking-wider ${isLocable ? "text-emerald-800" : "text-red-750"}`}>
              {isLocable ? "Ativo Homologado & Locável" : "Ativo Bloqueado / Não Locável"}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {isLocable 
                ? "Este veículo atende a todas as obrigações regulatórias municipais e está apto a operar e gerar receita."
                : `Existem restrições ou pendências no processo regulatório que impedem a locação deste ativo.`}
            </p>
            {pendingItems.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {pendingItems.map((item, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[9px] font-black uppercase rounded-md flex items-center gap-1">
                    <XCircle className="w-3 h-3 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] block font-black text-slate-500 uppercase tracking-wider">Status Atual do Veículo</span>
          <span className={`text-xs px-3 py-1 font-extrabold uppercase rounded-full border inline-block mt-1 ${
            status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
            status === "decommissioning" ? "bg-amber-100 text-amber-700 border-amber-200" :
            status === "blocked_regulatory" ? "bg-red-100 text-red-700 border-red-200" :
            "bg-slate-100 text-slate-700 border-slate-200"
          }`}>
            {status === "active" ? "Em operação" :
             status === "decommissioning" ? "Descredenciamento" :
             status === "blocked_regulatory" ? "Bloqueado Regulatório" :
             status}
          </span>
        </div>
      </div>

      {/* 2. City & Lifecycle Configurations */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Cidade da Regulamentação</label>
          <select
            disabled={readOnly}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs font-semibold outline-none"
          >
            <option value="São Paulo">São Paulo (DTP SP)</option>
            <option value="Campinas">Campinas (EMDEC)</option>
            <option value="Rio de Janeiro">Rio de Janeiro (SMTR RJ)</option>
            <option value="Belo Horizonte">Belo Horizonte (BHTRANS)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Tipo de Operação</label>
          <select
            disabled={readOnly}
            value={operationType}
            onChange={(e) => setOperationType(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs font-semibold outline-none"
          >
            <option value="taxi">Táxi Municipal</option>
            <option value="app">Aplicativo (Uber/99)</option>
            <option value="corporate">Corporativo / Executivo</option>
            <option value="van">Van Escolar / Fretamento</option>
            <option value="caminhao">Caminhão / Logística</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Ciclo de Vida Regulação</label>
          <select
            disabled={readOnly}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs font-bold outline-none text-primary"
          >
            <option value="acquisition">Em aquisição</option>
            <option value="awaiting_docs">Aguardando documentação</option>
            <option value="in_registration">Em credenciamento</option>
            <option value="awaiting_dtp">Aguardando vistoria DTP</option>
            <option value="awaiting_taximeter">Aguardando taxímetro</option>
            <option value="awaiting_gnv">Aguardando GNV</option>
            <option value="homologated">Homologado</option>
            <option value="active">Em operação (Locável)</option>
            <option value="blocked_regulatory">Bloqueado regulatório</option>
            <option value="decommissioning">Descredenciamento (Venda)</option>
            <option value="for_sale">À venda</option>
            <option value="sold">Vendido</option>
          </select>
        </div>
      </div>

      {/* Sub-tab Navigation (only visible for taxis) */}
      {isTaxi && (
        <div className="flex border-b border-outline-variant gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("checklist_gnv")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "checklist_gnv"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-white/50"
            }`}
          >
            <ClipboardList className="w-4 h-4 text-violet-600" />
            <span>📋 Checklist e Vistorias</span>
          </button>
          <button
            onClick={() => setActiveSubTab("alvara")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "alvara"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-white/50"
            }`}
          >
            <Scale className="w-4 h-4 text-yellow-600" />
            <span>🚖 Alvará de Estacionamento</span>
          </button>
          <button
            onClick={() => setActiveSubTab("filipeta")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "filipeta"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-white/50"
            }`}
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>🖨️ Filipeta de Vínculo (Preposto)</span>
          </button>
        </div>
      )}

      {/* ==================== SUB-TAB 1: CHECKLIST, GNV & VISTORIAS ==================== */}
      {(!isTaxi || activeSubTab === "checklist_gnv") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Activation Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-violet-650" />
                Checklist de Homologação Ativa
              </h5>
              <p className="text-[10px] text-slate-500">Marque as conformidades emitidas. Itens pendentes bloqueiam a locação.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                {[
                  { key: "invoice", label: "Nota Fiscal Faturada" },
                  { key: "crv", label: "CRV / Registro digital" },
                  { key: "renavam", label: "Renavam Ativo no Detran" },
                  { key: "insuranceActive", label: "Seguro Ativo (Apólice)" },
                  { key: "trackerInstalled", label: "Rastreador físico ativo" },
                  { key: "permitIssued", label: "Alvará municipal emitido", isTaxiOnly: true },
                  { key: "taximeterInstalled", label: "Taxímetro instalado", needsTaximeterOnly: true },
                  { key: "taximeterCalibrated", label: "Taxímetro aferido IPEM", needsTaximeterOnly: true },
                  { key: "dtpInspectionApproved", label: "Vistoria DTP aprovada", needsDtpOnly: true }
                ].map(item => {
                  if (item.isTaxiOnly && !isTaxi) return null;
                  if (item.needsTaximeterOnly && !needsTaximeter) return null;
                  if (item.needsDtpOnly && !needsDtp) return null;

                  return (
                    <label key={item.key} className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={(checklist as any)[item.key]}
                        onChange={(e) => {
                          setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }));
                        }}
                        className="rounded text-violet-600 focus:ring-violet-500 focus:ring-1 shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* GNV Module */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  ⛽ Sistema de GNV (Cilindro)
                </h5>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={gnvDetails.hasGnv}
                    onChange={(e) => setGnvDetails(prev => ({ ...prev, hasGnv: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  <span className="ml-2 text-[10px] font-bold text-slate-600">Possui GNV</span>
                </label>
              </div>

              {gnvDetails.hasGnv ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-2.5 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Alertas de Vencimento GNV</span>
                    {getGnvExpiryBadge(gnvDetails.cylinderExpiry)}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Número do Cilindro</label>
                      <input
                        type="text"
                        disabled={readOnly}
                        value={gnvDetails.cylinderSerial}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderSerial: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Fabricante</label>
                      <input
                        type="text"
                        disabled={readOnly}
                        value={gnvDetails.cylinderManufacturer}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderManufacturer: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Capacidade (m³)</label>
                      <input
                        type="text"
                        disabled={readOnly}
                        value={gnvDetails.cylinderCapacity}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderCapacity: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Data de Fabricação</label>
                      <input
                        type="date"
                        disabled={readOnly}
                        value={gnvDetails.cylinderMfgDate}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderMfgDate: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Última Vistoria GNV</label>
                      <input
                        type="date"
                        disabled={readOnly}
                        value={gnvDetails.cylinderLastInspection}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderLastInspection: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Vencimento do Cilindro</label>
                      <input
                        type="date"
                        disabled={readOnly}
                        value={gnvDetails.cylinderExpiry}
                        onChange={(e) => setGnvDetails(p => ({ ...p, cylinderExpiry: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 font-semibold italic">Este ativo não está equipado com cilindro GNV.</p>
                </div>
              )}
            </div>
          </div>

          {!readOnly && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProcess}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors shadow-sm"
              >
                Salvar Configurações e Checklist
              </button>
            </div>
          )}

          {/* Descredenciamento Wizard Section */}
          {status === "decommissioning" && (
            <div className="bg-amber-500/5 border border-amber-300 rounded-xl p-5 space-y-4">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                Fluxo de Descredenciamento e Retirada de Frota
              </h5>
              <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                O veículo está em fase de desvinculação e preparação para venda. Complete a cadeia de custódia abaixo para liberar o ativo para negociação ou baixa no DETRAN.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "contractClosed", label: "Contrato encerrado" },
                  { key: "taximeterRemoved", label: "Taxímetro removido" },
                  { key: "permitCancelled", label: "Alvará cancelado na prefeitura" },
                  { key: "dtpUpdated", label: "Baixa de DTP cadastrada" },
                  { key: "finesPaid", label: "Multas de trânsito quitadas" },
                  { key: "debtsPaid", label: "Débitos financeiros quitados" },
                  { key: "docsReleased", label: "Documentação de venda liberada" }
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={(decommissioningChecklist as any)[item.key]}
                      onChange={(e) => {
                        setDecommissioningChecklist(prev => ({ ...prev, [item.key]: e.target.checked }));
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 shrink-0"
                    />
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={async () => {
                    await handleSaveRegulatoryProcess(vehicleId, {
                      vehicleId, city, operationType, status: "decommissioning", checklist, gnvDetails, decommissioningChecklist, alvaraDetails, companyDetails
                    });
                    alert("Checklist de descredenciamento salvo.");
                  }}
                  className="px-4 py-2 border border-amber-300 bg-white text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors"
                >
                  Salvar Checklist Descredenciamento
                </button>
                <button
                  disabled={!isDecommissionComplete() || readOnly}
                  onClick={async () => {
                    await handleSaveRegulatoryProcess(vehicleId, {
                      vehicleId, city, operationType, status: "for_sale", checklist, gnvDetails, decommissioningChecklist, alvaraDetails, companyDetails
                    });
                    setStatus("for_sale");
                    alert("Veículo liberado para a venda com sucesso!");
                  }}
                  className="px-5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  ✓ Liberar para Venda
                </button>
                <button
                  disabled={!isDecommissionComplete() || readOnly}
                  onClick={async () => {
                    await handleSaveRegulatoryProcess(vehicleId, {
                      vehicleId, city, operationType, status: "sold", checklist, gnvDetails, decommissioningChecklist, alvaraDetails, companyDetails
                    });
                    setStatus("sold");
                    alert("Veículo marcado como vendido e desvinculado patrimonialmente!");
                  }}
                  className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  ✓ Finalizar Venda (Baixa)
                </button>
              </div>
            </div>
          )}

          {/* Taxímetro Section */}
          {needsTaximeter && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Gauge className="w-4 h-4 text-violet-650" />
                🚖 Registro de Ativo Regulatório: Taxímetro
              </h5>

              <form onSubmit={handleSaveTaximeterData} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Marca do Taxímetro</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={taximeter.brand}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Ex: FIP"
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Modelo</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={taximeter.model}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Ex: Taxilink 4.0"
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Número de Série</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={taximeter.serialNumber}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="Ex: TX-90812-B"
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Lacre IPEM</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={taximeter.ipemSeal}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, ipemSeal: e.target.value }))}
                    placeholder="Ex: LACRE-123456"
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Data da Aferição</label>
                  <input
                    type="date"
                    disabled={readOnly}
                    value={taximeter.calibrationDate}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, calibrationDate: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline mb-1">Validade Aferição</label>
                  <input
                    type="date"
                    disabled={readOnly}
                    value={taximeter.validUntil}
                    onChange={(e) => setTaximeter(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs outline-none font-semibold text-primary font-mono"
                  />
                </div>
                {!readOnly && (
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
                    >
                      Salvar Dados do Taxímetro
                    </button>
                  </div>
                )}
              </form>

              {/* Calibrations history logs list */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h6 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Histórico de Calibração, Aferições e Instalações</h6>
                
                {taximeter.history && taximeter.history.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {taximeter.history.map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center font-semibold">
                        <div>
                          <span className="font-mono text-slate-500 text-[10px] block">{new Date(log.date).toLocaleDateString("pt-BR")}</span>
                          <span className="text-primary">{log.description}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 border rounded text-[9px] font-black uppercase text-slate-600">
                          {log.type === "installation" ? "Instalação" :
                           log.type === "swap" ? "Substituição" :
                           log.type === "maintenance" ? "Manutenção" : "Aferição"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-white p-3 border border-slate-200 rounded-lg text-primary">
                    Nenhuma calibração ou manutenção registrada.
                  </p>
                )}

                {/* Add history entry form */}
                {!readOnly && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Descrição do Evento</label>
                      <input
                        type="text"
                        value={newHistory.description}
                        onChange={(e) => setNewHistory(p => ({ ...p, description: e.target.value }))}
                        placeholder="Ex: Nova aferição anual IPEM"
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Tipo</label>
                      <select
                        value={newHistory.type}
                        onChange={(e) => setNewHistory(p => ({ ...p, type: e.target.value as any }))}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs outline-none font-bold"
                      >
                        <option value="calibration">Aferição</option>
                        <option value="installation">Instalação</option>
                        <option value="swap">Substituição</option>
                        <option value="maintenance">Manutenção</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTaximeterHistory}
                      className="px-4 py-1.5 bg-violet-600 text-white font-bold text-xs rounded-lg hover:bg-violet-700 transition-colors flex justify-center items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Registrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vistorias Ledger */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-violet-650" />
              Vistorias e Licenças Periódicas (IPVA, Licenciamento, GNV, Alvará)
            </h5>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Add inspection form */}
              {!readOnly && (
                <form onSubmit={handleAddInspection} className="bg-white border border-slate-200 p-3 rounded-xl space-y-3 lg:col-span-1">
                  <h6 className="text-[10px] font-black uppercase text-slate-500">Agendar/Lançar Vistoria</h6>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Tipo de Vistoria</label>
                    <select
                      value={newInspection.type}
                      onChange={(e) => setNewInspection(p => ({ ...p, type: e.target.value as any }))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold text-primary"
                    >
                      <option value="alvara">Alvará Municipal</option>
                      <option value="gnv">GNV Periódico</option>
                      <option value="taximetro">Taxímetro</option>
                      <option value="inmetro">INMETRO</option>
                      <option value="licenciamento">Licenciamento</option>
                      <option value="seguros">Seguros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Data de Realização</label>
                    <input
                      type="date"
                      value={newInspection.lastInspectionDate}
                      onChange={(e) => setNewInspection(p => ({ ...p, lastInspectionDate: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Vencimento da Licença</label>
                    <input
                      type="date"
                      value={newInspection.validUntil}
                      onChange={(e) => setNewInspection(p => ({ ...p, validUntil: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Observações / Laudo</label>
                    <input
                      type="text"
                      value={newInspection.notes}
                      onChange={(e) => setNewInspection(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Ex: Aprovado sem restrições"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Vistoria
                  </button>
                </form>
              )}

              {/* List of inspections */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px]">Tipo</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px]">Última Vistoria</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px]">Vencimento</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px]">Status</th>
                      {!readOnly && <th className="px-4 py-2 font-bold text-slate-500 uppercase text-[9px] text-right">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vehicleInspections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic text-primary">Nenhuma vistoria registrada para este ativo.</td>
                      </tr>
                    ) : (
                      vehicleInspections.map((insp) => {
                        const expiryDate = new Date(insp.validUntil);
                        const today = new Date("2026-06-13");
                        const expired = expiryDate < today;
                        return (
                          <tr key={insp.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-bold capitalize">{insp.type}</td>
                            <td className="px-4 py-3 font-mono font-semibold">{new Date(insp.lastInspectionDate).toLocaleDateString("pt-BR")}</td>
                            <td className="px-4 py-3 font-mono font-semibold">{new Date(insp.validUntil).toLocaleDateString("pt-BR")}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                expired ? "bg-red-100 text-red-750 border border-red-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}>
                                {expired ? "Vencida" : "Ativa"}
                              </span>
                            </td>
                            {!readOnly && (
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteRegulatoryInspection(insp.id!)}
                                  className="p-1 hover:bg-red-50 text-red-650 rounded border border-transparent hover:border-red-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: ALVARÁ DE ESTACIONAMENTO ==================== */}
      {isTaxi && activeSubTab === "alvara" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            
            {/* Alvará Registry Form */}
            <div className="xl:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Scale className="w-4 h-4 text-violet-650" />
                Dados do Alvará de Estacionamento
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">N.º do Alvará</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.alvaraNumber}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, alvaraNumber: e.target.value }))}
                    placeholder="Ex: 12.345-AB"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Validade do Alvará</label>
                  <input
                    type="date"
                    disabled={readOnly}
                    value={alvaraDetails.validUntil}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, validUntil: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-bold text-primary font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Nome do Titular (Permissionário)</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.holderName}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, holderName: e.target.value }))}
                    placeholder="Ex: Luiz preposto de frota"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">CONDUTAX do Titular</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.condutax}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, condutax: e.target.value }))}
                    placeholder="Ex: 98.765.43-2"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Categoria CNH</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.cnhCategory}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, cnhCategory: e.target.value }))}
                    placeholder="Ex: D (EAR)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Endereço Licenciado</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.address}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, address: e.target.value }))}
                    placeholder="Ex: Rua São Paulo, 100 - São Paulo, SP"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Ponto de Estacionamento</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.parkingStation}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, parkingStation: e.target.value }))}
                    placeholder="Ex: Ponto Privativo 1502"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">2º Condutor Autorizado</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.authorizedDriver2}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, authorizedDriver2: e.target.value }))}
                    placeholder="Ex: Preposto 2 (Opcional)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Isenção Tributária</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.taxExemption}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, taxExemption: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Autorização Publicidade</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.publicity}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, publicity: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Data de Emissão</label>
                  <input
                    type="date"
                    disabled={readOnly}
                    value={alvaraDetails.issueDate}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, issueDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Número do Formulário</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.formNumber}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, formNumber: e.target.value }))}
                    placeholder="Ex: FORM-90812-C"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Observações Secretaria (SMT)</label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={alvaraDetails.smtObservation}
                    onChange={(e) => setAlvaraDetails(p => ({ ...p, smtObservation: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Link da Cópia Digital (PDF/Imagem)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={alvaraDetails.digitalCopyUrl}
                      onChange={(e) => setAlvaraDetails(p => ({ ...p, digitalCopyUrl: e.target.value }))}
                      placeholder="Cole o link ou selecione nos CRLVs"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                    {alvaraDetails.digitalCopyUrl && (
                      <a
                        href={alvaraDetails.digitalCopyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-200 border border-slate-300 rounded hover:bg-slate-300 text-xs font-bold flex items-center gap-1.5 text-primary"
                        title="Ver Documento"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProcess}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    Salvar Dados do Alvará
                  </button>
                </div>
              )}
            </div>

            {/* Visual Replica Card SP Alvará */}
            <div className="xl:col-span-3 flex flex-col justify-start items-center space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Réplica Visual do Alvará de Estacionamento</span>
              
              {/* Beige replica container */}
              <div 
                className="w-full max-w-[500px] border-[2px] border-[#92400e] bg-[#fdfaf2] p-4 text-[9px] font-sans text-stone-850 shadow-md rounded-lg relative overflow-hidden select-none"
                style={{
                  backgroundImage: "radial-gradient(#faeedb 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              >
                {/* Municipal Shield Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <Scale className="w-72 h-72 text-stone-900" />
                </div>

                <div className="border border-[#b45309]/30 p-3 bg-white/70 backdrop-blur-[1px] relative z-10 space-y-2.5 rounded">
                  {/* Top header */}
                  <div className="text-center border-b border-[#b45309]/35 pb-2">
                    <h5 className="font-extrabold text-[9px] uppercase tracking-wider text-amber-900">Prefeitura do Município de {city}</h5>
                    <p className="text-[8px] text-stone-500 font-bold uppercase mt-0.5">Secretaria Municipal de Transportes</p>
                    <p className="text-[10px] font-black text-amber-950 uppercase tracking-wider mt-1.5">Alvará de Estacionamento</p>
                    <div className="bg-[#fef3c7] text-[#92400e] font-black uppercase text-[9px] py-0.5 px-4 rounded-full border border-amber-250 inline-block mt-2 font-mono">
                      Táxi - Comum
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Alvará</span>
                      <span className="text-xs font-mono font-bold text-stone-900">{alvaraDetails.alvaraNumber || "-----------"}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Validade</span>
                      <span className="text-xs font-mono font-bold text-stone-900">
                        {alvaraDetails.validUntil ? new Date(alvaraDetails.validUntil).toLocaleDateString("pt-BR") : "--/--/----"}
                      </span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Via</span>
                      <span className="text-xs font-bold text-stone-950">1ª Via</span>
                    </div>

                    <div className="col-span-3 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Nome do Titular</span>
                      <span className="text-[10px] font-bold text-stone-900 uppercase">{alvaraDetails.holderName || "----------------------------"}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">CNH/Cat</span>
                      <span className="text-[9px] font-bold text-stone-900">{alvaraDetails.cnhCategory || "---"}</span>
                    </div>

                    <div className="col-span-4 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Endereço Licenciado</span>
                      <span className="text-[8.5px] font-semibold text-stone-800">{alvaraDetails.address || "------------------------------------------------"}</span>
                    </div>

                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">CONDUTAX</span>
                      <span className="text-[9px] font-mono font-bold text-stone-900">{alvaraDetails.condutax || "-----------"}</span>
                    </div>
                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">2º Condutor Autorizado</span>
                      <span className="text-[8.5px] font-bold text-stone-900">{alvaraDetails.authorizedDriver2 || "NÃO CONSTA"}</span>
                    </div>

                    <div className="col-span-4 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Ponto de Estacionamento</span>
                      <span className="text-[9px] font-black text-stone-950 uppercase">{alvaraDetails.parkingStation || "----------------------------"}</span>
                    </div>

                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Marca/Modelo</span>
                      <span className="text-[9px] font-bold text-stone-900">{selectedVehicle.brand} {selectedVehicle.model}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Placa</span>
                      <span className="text-[9px] font-mono font-bold text-stone-900 uppercase">{selectedVehicle.plate}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Isenção</span>
                      <span className="text-[8px] font-bold text-stone-700">{alvaraDetails.taxExemption || "Nenhuma"}</span>
                    </div>

                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Cor</span>
                      <span className="text-[9px] font-bold text-stone-900">{selectedVehicle.color}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Ano</span>
                      <span className="text-[9px] font-mono font-bold text-stone-900">{selectedVehicle.year}</span>
                    </div>
                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">N.º Chassi</span>
                      <span className="text-[8.5px] font-mono font-bold text-stone-900 uppercase">{selectedVehicle.chassis}</span>
                    </div>

                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Combustível</span>
                      <span className="text-[8.5px] font-bold text-stone-900">{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="col-span-1 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Capacidade</span>
                      <span className="text-[9px] font-bold text-stone-900">5</span>
                    </div>
                    <div className="col-span-2 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Publicidade</span>
                      <span className="text-[8px] font-bold text-stone-700">{alvaraDetails.publicity || "NÃO CONFIGURADA"}</span>
                    </div>

                    <div className="col-span-4 border-b border-stone-100 pb-1">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Observações</span>
                      <span className="text-[8px] font-semibold text-stone-600 block leading-tight">{alvaraDetails.smtObservation}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">Emissão</span>
                      <span className="text-[9px] font-mono font-bold text-stone-900">
                        {alvaraDetails.issueDate ? new Date(alvaraDetails.issueDate).toLocaleDateString("pt-BR") : "--/--/----"}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[6.5px] font-black text-stone-400 uppercase tracking-wide block">N.º Formulário</span>
                      <span className="text-[9px] font-mono font-bold text-stone-900">{alvaraDetails.formNumber || "------------"}</span>
                    </div>
                  </div>

                  {/* Simulative Barcode for authenticity */}
                  <div className="border-t border-dashed border-[#b45309]/30 pt-2 flex flex-col items-center">
                    <div className="h-6 w-full max-w-[320px] bg-neutral-950 bg-repeat-x opacity-85"
                      style={{
                        backgroundImage: "linear-gradient(90deg, #000 2px, transparent 2px, #000 4px, transparent 6px, #000 9px, transparent 9px, #000 11px)",
                        backgroundSize: "16px 100%"
                      }}
                    />
                    <span className="text-[6px] font-mono text-stone-500 font-bold uppercase mt-1">
                      AUTENTICIDADE CERTIFICADA SMT / DTP - PROCESSO FLEETOS V4.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: FILIPETA DE VÍNCULO (PREPOSTO) ==================== */}
      {isTaxi && activeSubTab === "filipeta" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            
            {/* Filipeta Setup Forms */}
            <div className="xl:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
              
              {/* Preposto selection */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-violet-650" />
                  Seleção do Motorista Preposto
                </h5>

                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-1">Selecione o Motorista Vinculado</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs font-semibold outline-none text-primary"
                  >
                    <option value="">Selecione...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} (CONDUTAX: {d.condutax || "Não informado"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-500 mt-1">
                    Selecione o motorista preposto para preencher a Filipeta automaticamente.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Nome Completo (Preposto)</label>
                    <input
                      type="text"
                      value={filipetaDriver.name}
                      onChange={(e) => setFilipetaDriver(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">N.º CONDUTAX</label>
                    <input
                      type="text"
                      value={filipetaDriver.condutax}
                      onChange={(e) => setFilipetaDriver(p => ({ ...p, condutax: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">URL da Foto 3x4 do Preposto</label>
                    <input
                      type="text"
                      value={filipetaDriver.photoUrl}
                      onChange={(e) => setFilipetaDriver(p => ({ ...p, photoUrl: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Company & Central Configurations */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Settings className="w-4 h-4 text-violet-650" />
                  Dados de Identificação de Frota / Rádio-Táxi
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Nome da Frota (Razão Social)</label>
                    <input
                      type="text"
                      value={companyDetails.companyName}
                      onChange={(e) => setCompanyDetails(p => ({ ...p, companyName: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">CNPJ da Frota</label>
                    <input
                      type="text"
                      value={companyDetails.cnpj}
                      onChange={(e) => setCompanyDetails(p => ({ ...p, cnpj: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">N.º do Registro no DTP</label>
                    <input
                      type="text"
                      value={companyDetails.dtpRegistration}
                      onChange={(e) => setCompanyDetails(p => ({ ...p, dtpRegistration: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Nome da Rádio-Táxi</label>
                    <input
                      type="text"
                      value={companyDetails.radioTaxiName || ""}
                      onChange={(e) => setCompanyDetails(p => ({ ...p, radioTaxiName: e.target.value }))}
                      placeholder="Ex: Central Táxi Sampa"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">URL da Logomarca da Rádio-Táxi</label>
                    <input
                      type="text"
                      value={companyDetails.radioTaxiLogoUrl || ""}
                      onChange={(e) => setCompanyDetails(p => ({ ...p, radioTaxiLogoUrl: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-255 rounded text-xs outline-none font-semibold text-primary"
                    />
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9.5px] text-amber-600 font-semibold leading-tight max-w-[150px]">
                    Salve para persistir esses dados cadastrais no prontuário.
                  </span>
                  <button
                    onClick={handleSaveProcess}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    Salvar Dados da Filipeta
                  </button>
                </div>
              )}
            </div>

            {/* Filipeta Visual Box & Print Cockpit */}
            <div className="xl:col-span-3 flex flex-col justify-start items-center space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visualização da Filipeta Plastificada</span>
              
              {/* Filipeta Visual Card Wrapper */}
              <div id="printable-filipeta-container" className="bg-white p-3 border rounded-2xl shadow-md border-slate-200">
                <div 
                  id="printable-filipeta" 
                  className="printable-filipeta w-[320px] border-[3px] border-double border-amber-700 p-3 bg-amber-50/20 rounded-xl box-sizing-border-box"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                >
                  {/* Card Header DTP */}
                  <div 
                    className="filipeta-header bg-[#fef08a] border border-[#eab308] text-center p-1.5 font-extrabold text-[10px] uppercase tracking-wider mb-2.5 rounded text-[#854d0e]"
                  >
                    Prefeitura do Município de {city} <br />
                    <span className="text-[8px] font-semibold">DTP - Credenciamento de Preposto</span>
                  </div>

                  {/* Body Content grid */}
                  <div className="filipeta-content grid grid-cols-[90px_1fr] gap-2.5">
                    {/* Driver Photo 3x4 box */}
                    <div className="photo-box w-[90px] h-[120px] border border-slate-300 rounded bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img 
                        src={filipetaDriver.photoUrl} 
                        alt="3x4 Preposto" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                        }}
                      />
                    </div>

                    {/* Technical details list */}
                    <div className="details-box flex flex-col gap-1 text-[9px]">
                      
                      <div className="field border-b border-slate-100 pb-0.5">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Frota (Empresa)</span>
                        <span className="value font-bold text-slate-800 uppercase block">{companyDetails.companyName}</span>
                      </div>

                      <div className="field border-b border-slate-100 pb-0.5">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">CNPJ / Registro DTP</span>
                        <span className="value font-mono font-bold text-slate-800 block text-[8px]">{companyDetails.cnpj} | {companyDetails.dtpRegistration}</span>
                      </div>

                      <div className="field border-b border-slate-100 pb-0.5">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Veículo (Marca/Modelo)</span>
                        <span className="value font-bold text-slate-800 uppercase block">{selectedVehicle.brand} {selectedVehicle.model}</span>
                      </div>

                      <div className="field border-b border-slate-100 pb-0.5">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Placa / N.º Alvará</span>
                        <span className="value font-mono font-bold text-slate-900 block text-[9px]">{selectedVehicle.plate} | {alvaraDetails.alvaraNumber || "PENDENTE"}</span>
                      </div>

                      <div className="field border-b border-slate-100 pb-0.5">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Condutor (Preposto)</span>
                        <span className="value font-bold text-slate-900 uppercase block">{filipetaDriver.name || "NENHUM SELECIONADO"}</span>
                      </div>

                      <div className="field">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Número CONDUTAX</span>
                        <span className="value font-mono font-black text-rose-700 block text-[9.5px]">{filipetaDriver.condutax || "EM EMISSÃO"}</span>
                      </div>

                    </div>
                  </div>

                  {/* Radio Taxi Vínculo section */}
                  {companyDetails.radioTaxiName && (
                    <div className="radio-taxi-section mt-2.5 border-t border-dashed border-slate-300 pt-2 flex items-center justify-between">
                      <div className="text-left">
                        <span className="label text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Vínculo Rádio-Táxi</span>
                        <span className="value text-[8px] font-bold text-slate-800">{companyDetails.radioTaxiName}</span>
                      </div>
                      {companyDetails.radioTaxiLogoUrl && (
                        <img 
                          src={companyDetails.radioTaxiLogoUrl} 
                          alt="Logo Rádio" 
                          className="radio-logo w-[35px] height-[25px] rounded border border-slate-200 bg-white object-contain"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Barcode simulation */}
                  <div 
                    className="barcode-sim h-4 bg-slate-900 bg-repeat-x opacity-60 mt-2 rounded"
                    style={{
                      backgroundImage: "linear-gradient(90deg, #000 2px, transparent 2px, #000 4px, transparent 6px, #000 9px, transparent 9px, #000 11px)",
                      backgroundSize: "14px 100%"
                    }}
                  />
                </div>
              </div>

              {/* Print action trigger button */}
              <div className="pt-2">
                <button
                  onClick={handlePrintFilipeta}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-extrabold rounded-xl text-xs transition-all shadow-md"
                >
                  <Printer className="w-4 h-4 animate-pulse" />
                  <span>Imprimir Filipeta Plastificada</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
