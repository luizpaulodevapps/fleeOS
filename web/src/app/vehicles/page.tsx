"use client";

import React from "react";
import { useVehicles } from "./_hooks/useVehicles";
import { VehiclesOverview } from "./_components/VehiclesOverview";
import { VehicleDossier } from "./_components/VehicleDossier";
import { VehicleModal } from "./_components/VehicleModal";
import { AssignDriverModal } from "./_components/AssignDriverModal";

export default function VehiclesPage() {
  const {
    // DB collections
    vehicles,
    attachments,
    assignments,
    drivers,
    assets,
    incidents,
    maintenances,
    maintenancePlan,
    checklists,
    timeline,
    acquisitions,
    contracts,
    payments,
    ledger,
    vehicleExpenses,
    
    // Status/UI
    searchTerm,
    setSearchTerm,
    loading,
    can,

    // Modals
    isModalOpen,
    setIsModalOpen,
    selectedVehicle,
    setSelectedVehicle,
    activeTab,
    setActiveTab,
    isDossierMode,
    setIsDossierMode,
    dossierVehicle,
    setDossierVehicle,
    isAssignModalOpen,
    setIsAssignModalOpen,
    selectedDriverIdForAssign,
    setSelectedDriverIdForAssign,

    // Form fields
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

    // Handlers
    loadData,
    computePerformance,
    isReadOnly,
    openNewVehicle,
    openVehicleProntuario,
    handleSaveAcquisition,
    handleSaveSpecs,
    handleSaveLocks,
    handleAddAsset,
    handleAddIncident,
    handleAddMaintenance,
    handleUploadDoc,
    handleAssignDriver,
    handleDeleteVehicle,
    getDriverName,
    getActiveDriver,
    filteredVehicles,
    categories
  } = useVehicles();

  const getExpirationBadge = (dateStr: string) => {
    if (!dateStr) return <span className="text-outline">N/A</span>;
    const expDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-error font-bold text-red-650">Vencido</span>;
    } else if (diffDays <= 30) {
      return <span className="text-amber-500 font-semibold">Vence em {diffDays}d</span>;
    }
    return <span className="text-emerald-650 font-medium">{expDate.toLocaleDateString("pt-BR")}</span>;
  };

  const handleOpenDossier = (vehicle: any) => {
    setDossierVehicle(vehicle);
    setIsDossierMode(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-on-surface-variant font-bold">Carregando frota operacional...</p>
      </div>
    );
  }

  if (isDossierMode && dossierVehicle) {
    return (
      <VehicleDossier
        vehicle={dossierVehicle}
        onClose={() => setIsDossierMode(false)}
        assignments={assignments}
        drivers={drivers}
        assets={assets}
        incidents={incidents}
        maintenances={maintenances}
        attachments={attachments}
        acquisitions={acquisitions}
        timeline={timeline}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-primary tracking-tight">Painel de Prontuários da Frota</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Gerenciamento centralizado de especificações, histórico técnico, bloqueios operacionais e centro de custos.
        </p>
      </div>

      <VehiclesOverview
        filteredVehicles={filteredVehicles}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openNewVehicle={openNewVehicle}
        openVehicleProntuario={openVehicleProntuario}
        handleOpenDossier={handleOpenDossier}
        handleDeleteVehicle={handleDeleteVehicle}
        getActiveDriver={getActiveDriver}
        getExpirationBadge={getExpirationBadge}
      />

      <VehicleModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedVehicle={selectedVehicle}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isReadOnly={isReadOnly}
        setIsDossierMode={setIsDossierMode}
        setDossierVehicle={setDossierVehicle}
        formData={formData}
        setFormData={setFormData}
        vehicleLocks={vehicleLocks}
        setVehicleLocks={setVehicleLocks}
        lockJustification={lockJustification}
        setLockJustification={setLockJustification}
        acqForm={acqForm}
        setAcqForm={setAcqForm}
        assetForm={assetForm}
        setAssetForm={setAssetForm}
        incidentForm={incidentForm}
        setIncidentForm={setIncidentForm}
        maintForm={maintForm}
        setMaintForm={setMaintForm}
        docForm={docForm}
        setDocForm={setDocForm}
        handleSaveAcquisition={handleSaveAcquisition}
        handleSaveSpecs={handleSaveSpecs}
        handleSaveLocks={handleSaveLocks}
        handleAddAsset={handleAddAsset}
        handleAddIncident={handleAddIncident}
        handleAddMaintenance={handleAddMaintenance}
        handleUploadDoc={handleUploadDoc}
        setSelectedDriverIdForAssign={setSelectedDriverIdForAssign}
        setIsAssignModalOpen={setIsAssignModalOpen}
        getDriverName={getDriverName}
        computePerformance={computePerformance}
        acquisitions={acquisitions}
        assignments={assignments}
        drivers={drivers}
        contracts={contracts}
        maintenancePlan={maintenancePlan}
        assets={assets}
        incidents={incidents}
        maintenances={maintenances}
        checklists={checklists}
        attachments={attachments}
        timeline={timeline}
        categories={categories}
      />

      <AssignDriverModal
        isAssignModalOpen={isAssignModalOpen}
        setIsAssignModalOpen={setIsAssignModalOpen}
        selectedVehicle={selectedVehicle}
        selectedDriverIdForAssign={selectedDriverIdForAssign}
        setSelectedDriverIdForAssign={setSelectedDriverIdForAssign}
        drivers={drivers}
        handleAssignDriver={handleAssignDriver}
      />
    </div>
  );
}
