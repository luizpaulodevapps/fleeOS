"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Plus, Lock } from "lucide-react";

// Hooks
import { useDrivers } from "./_hooks/useDrivers";

// Components
import { DriversTable } from "./_components/DriversTable";
import { DossierView } from "./_components/DossierView";
import { DriverProntuarioModal } from "./_components/DriverProntuarioModal";

export default function DriversManager() {
  const { can, currentUser } = useAuth();
  
  // Custom Hook
  const {
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
    deleteDriver
  } = useDrivers();

  const [searchTerm, setSearchTerm] = useState("");

  // Modals / View modes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  
  const [isDossierMode, setIsDossierMode] = useState(false);
  const [dossierDriver, setDossierDriver] = useState<any | null>(null);

  // Workspace active driver
  const [activeDriver, setActiveDriver] = useState<any | null>(null);

  // Sync active driver with latest list updates (e.g. balance, edit form saves)
  React.useEffect(() => {
    if (activeDriver) {
      const latest = drivers.find(d => d.id === activeDriver.id);
      if (latest) {
        setActiveDriver(latest);
      } else {
        // If driver was deleted or archived, clear workspace selection
        setActiveDriver(null);
      }
    }
  }, [drivers, activeDriver]);

  // Handlers
  const handleOpenNewDriver = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenProntuario = (driver: any) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleOpenDossier = (driver: any) => {
    setDossierDriver(driver);
    setIsDossierMode(true);
  };

  const handleDeleteDriverWithClear = async (id: string) => {
    await deleteDriver(id);
    if (activeDriver && activeDriver.id === id) {
      setActiveDriver(null);
    }
  };

  if (isDossierMode && dossierDriver) {
    const balance = getDriverBalance(dossierDriver.id);
    return (
      <DossierView
        driver={dossierDriver}
        ledger={ledger}
        occurrences={occurrences}
        assignments={assignments}
        attachments={attachments}
        timeline={timeline}
        vehicles={vehicles}
        balance={balance}
        onClose={() => setIsDossierMode(false)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Cadastros</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Motoristas</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            <span>ERP Prontuário de Motoristas</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Gestão completa de prontuários, conta corrente, documentos digitais, suspensões e histórico de veículos.
          </p>
        </div>
        <button
          disabled={!can("drivers.create")}
          onClick={handleOpenNewDriver}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold transition-all text-xs ${
            can("drivers.create")
              ? "bg-primary text-on-primary hover:opacity-90"
              : "bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50"
          }`}
        >
          {can("drivers.create") ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>Novo Motorista</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs">Carregando prontuários...</p>
        </div>
      ) : (
        <DriversTable
          drivers={drivers}
          activeDriver={activeDriver}
          setActiveDriver={setActiveDriver}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          getDriverBalance={getDriverBalance}
          assignments={assignments}
          vehicles={vehicles}
          occurrences={occurrences}
          claims={claims}
          infractions={infractions}
          timeline={timeline}
          onOpenProntuario={handleOpenProntuario}
          onOpenDossier={handleOpenDossier}
          onDeleteDriver={handleDeleteDriverWithClear}
          can={can}
        />
      )}

      {/* Detailed prontuario modal workspace */}
      <DriverProntuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDriver={selectedDriver}
        vehicles={vehicles}
        assignments={assignments}
        contracts={contracts}
        ledger={ledger}
        occurrences={occurrences}
        infractions={infractions}
        attachments={attachments}
        timeline={timeline}
        templates={templates}
        can={can}
        currentUser={currentUser}
        getDriverBalance={getDriverBalance}
        onSavePersonalData={savePersonalData}
        onSaveLocks={saveLocks}
        onSimulateContract={simulateContract}
        onAddOccurrence={addOccurrence}
        onUploadDoc={uploadDoc}
        onAddLedgerEntry={addLedgerEntry}
        onAddInfraction={addInfraction}
        onOpenDossier={handleOpenDossier}
      />
    </div>
  );
}
