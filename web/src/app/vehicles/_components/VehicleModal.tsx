"use client";

import React from "react";
import { 
  X, ShieldAlert, Settings, Banknote, TrendingUp, Zap, 
  User, Tag, AlertTriangle, Wrench, ClipboardList, Paperclip, 
  Activity, Printer 
} from "lucide-react";

import { VehicleSpecsTab } from "./VehicleSpecsTab";
import { VehicleAcqTab } from "./VehicleAcqTab";
import { VehiclePerformanceTab } from "./VehiclePerformanceTab";
import { VehicleCurrentOpTab } from "./VehicleCurrentOpTab";
import { VehicleLocksTab } from "./VehicleLocksTab";
import { VehicleDriversTab } from "./VehicleDriversTab";
import { VehicleAssetsTab } from "./VehicleAssetsTab";
import { VehicleIncidentsTab } from "./VehicleIncidentsTab";
import { VehicleMaintTab } from "./VehicleMaintTab";
import { VehicleChecklistsTab } from "./VehicleChecklistsTab";
import { VehicleDocsTab } from "./VehicleDocsTab";
import { VehicleHistoryTab } from "./VehicleHistoryTab";

interface VehicleModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  selectedVehicle: any | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isReadOnly: (vehicle: any) => boolean;
  setIsDossierMode: (isMode: boolean) => void;
  setDossierVehicle: (vehicle: any) => void;
  formData: any;
  setFormData: any;
  vehicleLocks: any;
  setVehicleLocks: any;
  lockJustification: any;
  setLockJustification: any;
  acqForm: any;
  setAcqForm: any;
  assetForm: any;
  setAssetForm: any;
  incidentForm: any;
  setIncidentForm: any;
  maintForm: any;
  setMaintForm: any;
  docForm: any;
  setDocForm: any;
  
  // Handlers
  handleSaveAcquisition: () => Promise<void>;
  handleSaveSpecs: (e: React.FormEvent) => Promise<void>;
  handleSaveLocks: () => Promise<void>;
  handleAddAsset: (e: React.FormEvent) => Promise<void>;
  handleAddIncident: (e: React.FormEvent) => Promise<void>;
  handleAddMaintenance: (e: React.FormEvent) => Promise<void>;
  handleUploadDoc: (e: React.FormEvent) => Promise<void>;
  setSelectedDriverIdForAssign: (id: string) => void;
  setIsAssignModalOpen: (isOpen: boolean) => void;
  getDriverName: (id: string) => string;
  computePerformance: (id: string) => any;
  
  // Collections
  acquisitions: any[];
  assignments: any[];
  drivers: any[];
  contracts: any[];
  maintenancePlan: any[];
  assets: any[];
  incidents: any[];
  maintenances: any[];
  checklists: any[];
  attachments: any[];
  timeline: any[];
  categories: any[];
}

export function VehicleModal({
  isModalOpen,
  setIsModalOpen,
  selectedVehicle,
  activeTab,
  setActiveTab,
  isReadOnly,
  setIsDossierMode,
  setDossierVehicle,
  formData,
  setFormData,
  vehicleLocks,
  setVehicleLocks,
  lockJustification,
  setLockJustification,
  acqForm,
  setAcqForm,
  assetForm,
  setAssetForm,
  incidentForm,
  setIncidentForm,
  maintForm,
  setMaintForm,
  docForm,
  setDocForm,
  handleSaveAcquisition,
  handleSaveSpecs,
  handleSaveLocks,
  handleAddAsset,
  handleAddIncident,
  handleAddMaintenance,
  handleUploadDoc,
  setSelectedDriverIdForAssign,
  setIsAssignModalOpen,
  getDriverName,
  computePerformance,
  acquisitions,
  assignments,
  drivers,
  contracts,
  maintenancePlan,
  assets,
  incidents,
  maintenances,
  checklists,
  attachments,
  timeline,
  categories
}: VehicleModalProps) {
  if (!isModalOpen) return null;

  const readOnly = selectedVehicle && isReadOnly(selectedVehicle);

  const tabs = [
    { id: "specs", label: "Ficha Técnica", icon: Settings, requiresVehicle: false },
    { id: "acquisition", label: "Patrimônio", icon: Banknote, requiresVehicle: true, highlight: true },
    { id: "performance", label: "Performance", icon: TrendingUp, requiresVehicle: true, highlight: true },
    { id: "current_op", label: "Operação Atual", icon: Zap, requiresVehicle: true, highlight: true },
    { id: "locks", label: "Bloqueios & Travas", icon: ShieldAlert, requiresVehicle: true },
    { id: "drivers", label: "Histórico Motoristas", icon: User, requiresVehicle: true },
    { id: "assets", label: "Equipamentos (Assets)", icon: Tag, requiresVehicle: true },
    { id: "incidents", label: "Sinistros & Avarias", icon: AlertTriangle, requiresVehicle: true },
    { id: "maintenance", label: "Manutenção & OS", icon: Wrench, requiresVehicle: true },
    { id: "checklists", label: "Vistorias Checklists", icon: ClipboardList, requiresVehicle: true },
    { id: "docs", label: "Documentos CRLV", icon: Paperclip, requiresVehicle: true },
    { id: "timeline", label: "Histórico Auditoria", icon: Activity, requiresVehicle: true }
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-obsidian-950/45 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-background border border-outline-variant rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-primary font-geist flex items-center gap-2">
              <span>Prontuário Digital do Ativo</span>
              {selectedVehicle && (
                <span className="font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-xs text-on-surface font-bold">
                  {selectedVehicle.plate}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              {selectedVehicle ? `Gestão de prontuário, histórico operacional, sinistros e OS.` : "Adicionar veículo e inicializar prontuário na frota."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedVehicle && (
              <button
                onClick={() => {
                  setDossierVehicle(selectedVehicle);
                  setIsDossierMode(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container text-xs font-bold text-primary transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Dossiê Impresso</span>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Read-only Alert Banner */}
        {readOnly && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-xs text-red-650 font-bold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>VEÍCULO RETIRADO / BAIXADO: Este ativo operacional foi baixado ou vendido e está em modo permanente de "Apenas Leitura".</span>
          </div>
        )}

        {/* Modal Content layout */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Sidebar Tabs */}
          <div className="w-64 bg-surface-container-low border-r border-outline-variant/60 p-4 space-y-1 overflow-y-auto">
            {tabs.map((t: any) => {
              const Icon = t.icon;
              const isLocked = t.requiresVehicle && !selectedVehicle;
              return (
                <button
                  key={t.id}
                  onClick={() => !isLocked && setActiveTab(t.id)}
                  disabled={isLocked}
                  title={isLocked ? "Salve o veículo primeiro para acessar esta aba" : undefined}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                    isLocked
                      ? "text-outline/40 cursor-not-allowed opacity-50"
                      : activeTab === t.id
                      ? t.highlight ? "bg-violet-600 text-white" : "bg-primary text-on-primary"
                      : t.highlight
                      ? "text-violet-700 hover:bg-violet-50 hover:text-violet-900"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {isLocked && <span className="ml-auto text-[8px] font-bold text-outline/50">NOVO</span>}
                  {!isLocked && t.highlight && activeTab !== t.id && (
                    <span className="ml-auto text-[8px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">NOVO</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto bg-surface-container-lowest">

            {/* Placeholder for restricted tabs in New Vehicle mode */}
            {!selectedVehicle && activeTab !== "specs" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <Settings className="w-8 h-8 text-outline/40" />
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">Salve a Ficha Técnica primeiro</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                    Preencha e salve os dados da Ficha Técnica para habilitar as demais abas deste prontuário.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("specs")}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Ir para Ficha Técnica
                </button>
              </div>
            )}

            {/* Render active tab content */}
            {activeTab === "specs" && (
              <VehicleSpecsTab
                formData={formData}
                setFormData={setFormData}
                selectedVehicle={selectedVehicle}
                isReadOnly={isReadOnly}
                handleSaveSpecs={handleSaveSpecs}
                categories={categories}
                setAcqForm={setAcqForm}
              />
            )}

            {activeTab === "acquisition" && selectedVehicle && (
              <VehicleAcqTab
                selectedVehicle={selectedVehicle}
                acqForm={acqForm}
                setAcqForm={setAcqForm}
                handleSaveAcquisition={handleSaveAcquisition}
                acquisitions={acquisitions}
              />
            )}

            {activeTab === "performance" && selectedVehicle && (
              <VehiclePerformanceTab
                selectedVehicle={selectedVehicle}
                computePerformance={computePerformance}
              />
            )}

            {activeTab === "current_op" && selectedVehicle && (
              <VehicleCurrentOpTab
                selectedVehicle={selectedVehicle}
                assignments={assignments}
                drivers={drivers}
                contracts={contracts}
                maintenancePlan={maintenancePlan}
              />
            )}

            {activeTab === "locks" && selectedVehicle && (
              <VehicleLocksTab
                selectedVehicle={selectedVehicle}
                isReadOnly={isReadOnly}
                vehicleLocks={vehicleLocks}
                setVehicleLocks={setVehicleLocks}
                lockJustification={lockJustification}
                setLockJustification={setLockJustification}
                handleSaveLocks={handleSaveLocks}
              />
            )}

            {activeTab === "drivers" && selectedVehicle && (
              <VehicleDriversTab
                selectedVehicle={selectedVehicle}
                assignments={assignments}
                drivers={drivers}
                isReadOnly={isReadOnly}
                setSelectedDriverIdForAssign={setSelectedDriverIdForAssign}
                setIsAssignModalOpen={setIsAssignModalOpen}
                getDriverName={getDriverName}
              />
            )}

            {activeTab === "assets" && selectedVehicle && (
              <VehicleAssetsTab
                selectedVehicle={selectedVehicle}
                assets={assets}
                assetForm={assetForm}
                setAssetForm={setAssetForm}
                handleAddAsset={handleAddAsset}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === "incidents" && selectedVehicle && (
              <VehicleIncidentsTab
                selectedVehicle={selectedVehicle}
                incidents={incidents}
                drivers={drivers}
                incidentForm={incidentForm}
                setIncidentForm={setIncidentForm}
                handleAddIncident={handleAddIncident}
                isReadOnly={isReadOnly}
                getDriverName={getDriverName}
              />
            )}

            {activeTab === "maintenance" && selectedVehicle && (
              <VehicleMaintTab
                selectedVehicle={selectedVehicle}
                maintenancePlan={maintenancePlan}
                maintenances={maintenances}
                maintForm={maintForm}
                setMaintForm={setMaintForm}
                handleAddMaintenance={handleAddMaintenance}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === "checklists" && selectedVehicle && (
              <VehicleChecklistsTab
                selectedVehicle={selectedVehicle}
                checklists={checklists}
                getDriverName={getDriverName}
              />
            )}

            {activeTab === "docs" && selectedVehicle && (
              <VehicleDocsTab
                selectedVehicle={selectedVehicle}
                attachments={attachments}
                docForm={docForm}
                setDocForm={setDocForm}
                handleUploadDoc={handleUploadDoc}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === "timeline" && selectedVehicle && (
              <VehicleHistoryTab
                selectedVehicle={selectedVehicle}
                timeline={timeline}
              />
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
          >
            Fechar Prontuário
          </button>
        </div>

      </div>
    </div>
  );
}
