"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Plus } from "lucide-react";

// Hooks
import { useClaims } from "./_hooks/useClaims";

// Components
import { ClaimsTable } from "./_components/ClaimsTable";
import { NewClaimModal } from "./_components/NewClaimModal";
import { ClaimDetailsModal } from "./_components/ClaimDetailsModal";

export default function ClaimsManager() {
  const { can, currentUser } = useAuth();
  
  // Custom Hook
  const {
    claims,
    drivers,
    vehicles,
    priceTable,
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
    closeClaim
  } = useClaims();

  // Page States for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Modal Controls
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);

  // Filter Claims
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const drvName = getDriverName(c.driverId).toLowerCase();
      const vehInfo = getVehiclePlate(c.vehicleId).toLowerCase();
      const searchMatch =
        drvName.includes(searchTerm.toLowerCase()) ||
        vehInfo.includes(searchTerm.toLowerCase()) ||
        c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === "all" || c.status === statusFilter;
      const severityMatch = severityFilter === "all" || c.severity === severityFilter;
      return searchMatch && statusMatch && severityMatch;
    });
  }, [claims, searchTerm, statusFilter, severityFilter, getDriverName, getVehiclePlate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Operações</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Sinistros</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span>ERP Gestão de Sinistros</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Controle de ponta a ponta: do registro da colisão ao BO, checklists de fotos, estimativa de danos, orçamentos, aprovações de diretoria e parcelamento no extrato.
          </p>
        </div>
        {can("claims.edit") && (
          <button
            onClick={() => setIsNewClaimModalOpen(true)}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Novo Sinistro</span>
          </button>
        )}
      </div>

      {/* Claims Table component */}
      <ClaimsTable
        claims={claims}
        filteredClaims={filteredClaims}
        activeClaimsCount={activeClaimsCount}
        repairingClaimsCount={repairingClaimsCount}
        closedClaimsCount={closedClaimsCount}
        totalDamageCost={totalDamageCost}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        getDriverName={getDriverName}
        getVehiclePlate={getVehiclePlate}
        onSelectClaim={setSelectedClaim}
      />

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={isNewClaimModalOpen}
        onClose={() => setIsNewClaimModalOpen(false)}
        drivers={drivers}
        vehicles={vehicles}
        onSubmit={createClaim}
      />

      {/* Detailed Claim details modal */}
      {selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          getDriverName={getDriverName}
          getVehiclePlate={getVehiclePlate}
          can={can}
          currentUser={currentUser}
          priceTable={priceTable}
          checklists={checklists}
          evidences={evidences}
          damageItems={damageItems}
          budgets={budgets}
          installments={installments}
          approvals={approvals}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          checklistForm={checklistForm}
          setChecklistForm={setChecklistForm}
          boForm={boForm}
          setBoForm={setBoForm}
          tpForm={tpForm}
          setTpForm={setTpForm}
          updateChecklist={updateChecklist}
          addEvidence={addEvidence}
          saveBO={saveBO}
          saveThirdParty={saveThirdParty}
          addDamageItem={addDamageItem}
          deleteDamageItem={deleteDamageItem}
          addBudget={addBudget}
          approveBudget={approveBudget}
          confirmBilling={confirmBilling}
          roleApproval={roleApproval}
          closeClaim={closeClaim}
        />
      )}
    </div>
  );
}
