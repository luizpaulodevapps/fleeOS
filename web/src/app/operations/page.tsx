"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useOperations } from "./_hooks/useOperations";
import { OperationsOverview } from "./_components/OperationsOverview";
import { DeliveryWizard } from "./_components/DeliveryWizard";
import { ReturnWizard } from "./_components/ReturnWizard";
import { SwapWizard } from "./_components/SwapWizard";

export default function OperationsCenter() {
  const {
    // DB collections
    drivers,
    vehicles,
    contracts,
    dailyProfiles,
    cashierSessions,
    contractTemplates,
    assignments,
    companies,
    categories,
    tables,
    rates,
    packages,
    billingProfiles,
    exemptions,
    
    // Status/UI
    loading,
    activeWizard,
    recentActivities,
    openCashier,
    companyProfile,
    can,

    // Step state handlers
    setActiveWizard,
    
    // Delivery states & helpers
    delStep,
    setDelStep,
    delForm,
    setDelForm,
    selectedDelDriver,
    selectedDelVehicle,
    selectedDelProfile,
    computedDailyRate,
    computedDailyProfileName,
    deliveryContractText,
    handleDelNext,
    handleDelPrev,
    submitDelivery,
    resetDelForm,
    availableDrivers,
    availableVehicles,

    // Return states & helpers
    retStep,
    setRetStep,
    retForm,
    setRetForm,
    selectedRetVehicle,
    activeAssignment,
    activeContract,
    activeDriver,
    returnContractText,
    handleRetNext,
    handleRetPrev,
    submitReturn,
    resetRetForm,

    // Swap states & helpers
    swapStep,
    setSwapStep,
    swapForm,
    setSwapForm,
    selectedSwapDriver,
    selectedOldVehicle,
    selectedNewVehicle,
    activeSwapAssignment,
    activeSwapContract,
    driversWithVehicles,
    handleSwapNext,
    handleSwapPrev,
    submitSwap,
    resetSwapForm
  } = useOperations();

  // Return Restricted Screen if user cannot edit vehicles
  if (!can("vehicles.edit")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-lg space-y-4 max-w-md mx-auto my-12">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-600">
          <span className="material-symbols-outlined text-[48px]">lock</span>
        </div>
        <h2 className="text-xl font-extrabold text-primary font-geist">Acesso Restrito</h2>
        <p className="text-on-surface-variant text-xs">
          O seu perfil de acesso não possui a permissão `"vehicles.edit"` necessária para operar a Central de Operações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer" onClick={() => setActiveWizard(null)}>Operações</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">
          {activeWizard === "delivery" && "Wizard de Entrega"}
          {activeWizard === "return" && "Wizard de Devolução"}
          {activeWizard === "swap" && "Wizard de Troca"}
          {!activeWizard && "Painel Geral"}
        </span>
      </nav>

      {/* Main Header */}
      {!activeWizard && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span>Central de Operações</span>
            </h1>
            <p className="text-on-surface-variant text-xs mt-1">
              Gerencie a circulação física da frota por meio de fluxos guiados integrados que garantem a conformidade documental, técnica e financeira.
            </p>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs">Aguardando processamento de dados...</p>
        </div>
      )}

      {/* Main Dashboard / Wizards */}
      {!loading && !activeWizard && (
        <OperationsOverview
          openCashier={openCashier}
          recentActivities={recentActivities}
          onStartDelivery={() => {
            resetDelForm();
            setActiveWizard("delivery");
          }}
          onStartReturn={() => {
            resetRetForm();
            setActiveWizard("return");
          }}
          onStartSwap={() => {
            resetSwapForm();
            setActiveWizard("swap");
          }}
        />
      )}

      {!loading && activeWizard === "delivery" && (
        <DeliveryWizard
          delStep={delStep}
          setDelStep={setDelStep}
          delForm={delForm}
          setDelForm={setDelForm}
          drivers={drivers}
          vehicles={vehicles}
          assignments={assignments}
          tables={tables}
          packages={packages}
          billingProfiles={billingProfiles}
          dailyProfiles={dailyProfiles}
          recentActivities={recentActivities}
          openCashier={openCashier}
          selectedDelDriver={selectedDelDriver}
          selectedDelVehicle={selectedDelVehicle}
          selectedDelProfile={selectedDelProfile}
          computedDailyRate={computedDailyRate}
          computedDailyProfileName={computedDailyProfileName}
          deliveryContractText={deliveryContractText}
          handleDelNext={handleDelNext}
          handleDelPrev={handleDelPrev}
          submitDelivery={submitDelivery}
          resetDelForm={resetDelForm}
          setActiveWizard={setActiveWizard}
        />
      )}

      {!loading && activeWizard === "return" && (
        <ReturnWizard
          retStep={retStep}
          setRetStep={setRetStep}
          retForm={retForm}
          setRetForm={setRetForm}
          vehicles={vehicles}
          assignments={assignments}
          activeAssignment={activeAssignment}
          activeContract={activeContract}
          activeDriver={activeDriver}
          selectedRetVehicle={selectedRetVehicle}
          returnContractText={returnContractText}
          handleRetNext={handleRetNext}
          handleRetPrev={handleRetPrev}
          submitReturn={submitReturn}
          setActiveWizard={setActiveWizard}
        />
      )}

      {!loading && activeWizard === "swap" && (
        <SwapWizard
          swapStep={swapStep}
          setSwapStep={setSwapStep}
          swapForm={swapForm}
          setSwapForm={setSwapForm}
          vehicles={vehicles}
          availableVehicles={availableVehicles}
          driversWithVehicles={driversWithVehicles}
          activeSwapAssignment={activeSwapAssignment}
          selectedOldVehicle={selectedOldVehicle}
          selectedNewVehicle={selectedNewVehicle}
          selectedSwapDriver={selectedSwapDriver}
          handleSwapNext={handleSwapNext}
          handleSwapPrev={handleSwapPrev}
          submitSwap={submitSwap}
          setActiveWizard={setActiveWizard}
        />
      )}
    </div>
  );
}
