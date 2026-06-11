"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import { usePricing } from "./_hooks/usePricing";
import { CategoriesTab } from "./_components/CategoriesTab";
import { RatesTab } from "./_components/RatesTab";
import { CalendarTab } from "./_components/CalendarTab";
import { PackagesTab } from "./_components/PackagesTab";
import { ProjectionsTab } from "./_components/ProjectionsTab";
import { SimulatorTab } from "./_components/SimulatorTab";

export default function PricingEngine() {
  const {
    activeTab,
    setActiveTab,
    loading,
    can,
    loadData,
    deleteDocument,

    // Database states
    categories,
    tables,
    rates,
    calendar,
    exemptions,
    packages,
    vehicles,
    drivers,

    // Modals
    isCatModalOpen,
    setIsCatModalOpen,
    editingCat,
    setEditingCat,
    catForm,
    setCatForm,

    isTblModalOpen,
    setIsTblModalOpen,
    editingTbl,
    setEditingTbl,
    tblForm,
    setTblForm,

    isRateModalOpen,
    setIsRateModalOpen,
    rateForm,
    setRateForm,

    isCalModalOpen,
    setIsCalModalOpen,
    editingCal,
    setEditingCal,
    calForm,
    setCalForm,

    isPkgModalOpen,
    setIsPkgModalOpen,
    editingPkg,
    setEditingPkg,
    pkgForm,
    setPkgForm,

    isExModalOpen,
    setIsExModalOpen,
    exForm,
    setExForm,

    // Simulator states
    projCategory,
    setProjCategory,
    projRate,
    setProjRate,
    projOccupancy,
    setProjOccupancy,
    projectionResults,

    simDriverId,
    setSimDriverId,
    simStartDate,
    setSimStartDate,
    simEndDate,
    setSimEndDate,
    simResults,

    // Operations
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveTable,
    handleDeleteTable,
    handleSaveRate,
    handleDeleteRate,
    handleSaveCal,
    handleFetchHolidays,
    handleSavePackage,
    handleSaveExemption,
    handleRunSimulation,
    handleExecuteBilling
  } = usePricing();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span>Pricing & Billing Engine</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Configure o motor inteligente de precificação e faturamento de diárias, isenções, adicionais de pacotes e simulação de ROI da frota.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-outline-variant text-xs font-semibold gap-4 overflow-x-auto pb-1">
        {[
          { id: "categories", name: "📋 Categorias" },
          { id: "rates", name: "💲 Tabelas & Tarifas" },
          { id: "calendar", name: "📅 Calendário" },
          { id: "packages", name: "🎁 Pacotes & Isenções" },
          { id: "projections", name: "📈 Projeções" },
          { id: "simulator", name: "⚡ Simulador de Faturamento" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 px-1 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "border-primary text-primary font-black scale-105"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-xs">Atualizando motor de cálculo...</p>
        </div>
      )}

      {/* Renders active tab */}
      {!loading && activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          vehicles={vehicles}
          isCatModalOpen={isCatModalOpen}
          setIsCatModalOpen={setIsCatModalOpen}
          editingCat={editingCat}
          setEditingCat={setEditingCat}
          catForm={catForm}
          setCatForm={setCatForm}
          handleSaveCategory={handleSaveCategory}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}

      {!loading && activeTab === "rates" && (
        <RatesTab
          rates={rates}
          tables={tables}
          categories={categories}
          isTblModalOpen={isTblModalOpen}
          setIsTblModalOpen={setIsTblModalOpen}
          editingTbl={editingTbl}
          setEditingTbl={setEditingTbl}
          tblForm={tblForm}
          setTblForm={setTblForm}
          isRateModalOpen={isRateModalOpen}
          setIsRateModalOpen={setIsRateModalOpen}
          rateForm={rateForm}
          setRateForm={setRateForm}
          handleSaveTable={handleSaveTable}
          handleDeleteTable={handleDeleteTable}
          handleSaveRate={handleSaveRate}
          handleDeleteRate={handleDeleteRate}
        />
      )}

      {!loading && activeTab === "calendar" && (
        <CalendarTab
          calendar={calendar}
          tables={tables}
          isCalModalOpen={isCalModalOpen}
          setIsCalModalOpen={setIsCalModalOpen}
          editingCal={editingCal}
          setEditingCal={setEditingCal}
          calForm={calForm}
          setCalForm={setCalForm}
          handleSaveCal={handleSaveCal}
          handleFetchHolidays={handleFetchHolidays}
          handleDeleteCal={async (id) => {
            if (confirm("Remover data especial?")) {
              await deleteDocument("pricing_calendar", id);
              loadData();
            }
          }}
        />
      )}

      {!loading && activeTab === "packages" && (
        <PackagesTab
          packages={packages}
          exemptions={exemptions}
          drivers={drivers}
          categories={categories}
          isPkgModalOpen={isPkgModalOpen}
          setIsPkgModalOpen={setIsPkgModalOpen}
          editingPkg={editingPkg}
          setEditingPkg={setEditingPkg}
          pkgForm={pkgForm}
          setPkgForm={setPkgForm}
          isExModalOpen={isExModalOpen}
          setIsExModalOpen={setIsExModalOpen}
          exForm={exForm}
          setExForm={setExForm}
          handleSavePackage={handleSavePackage}
          handleSaveExemption={handleSaveExemption}
          handleDeleteExemption={async (id) => {
            if (confirm("Remover isenção contratual?")) {
              await deleteDocument("pricing_exemptions", id);
              loadData();
            }
          }}
        />
      )}

      {!loading && activeTab === "projections" && (
        <ProjectionsTab
          categories={categories}
          projCategory={projCategory}
          setProjCategory={setProjCategory}
          projRate={projRate}
          setProjRate={setProjRate}
          projOccupancy={projOccupancy}
          setProjOccupancy={setProjOccupancy}
          projectionResults={projectionResults}
        />
      )}

      {!loading && activeTab === "simulator" && (
        <SimulatorTab
          drivers={drivers}
          simDriverId={simDriverId}
          setSimDriverId={setSimDriverId}
          simStartDate={simStartDate}
          setSimStartDate={setSimStartDate}
          simEndDate={simEndDate}
          setSimEndDate={setSimEndDate}
          simResults={simResults}
          handleRunSimulation={handleRunSimulation}
          handleExecuteBilling={handleExecuteBilling}
        />
      )}
    </div>
  );
}
