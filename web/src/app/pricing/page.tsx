"use client";

import React from "react";
import { DollarSign, Filter } from "lucide-react";
import { usePricing } from "./_hooks/usePricing";
import { CategoriesTab } from "./_components/CategoriesTab";
import { RatesTab } from "./_components/RatesTab";
import { CalendarTab } from "./_components/CalendarTab";
import { PackagesTab } from "./_components/PackagesTab";
import { ProjectionsTab } from "./_components/ProjectionsTab";
import { SimulatorTab } from "./_components/SimulatorTab";
import { ContractTypesTab } from "./_components/ContractTypesTab";
import { BillingProfilesTab } from "./_components/BillingProfilesTab";
import { VersioningTab } from "./_components/VersioningTab";

export default function PricingEngine() {
  const {
    // Navigation & UI filter states
    activeTab,
    setActiveTab,
    loading,
    can,
    loadData,
    deleteDocument,
    selectedOperationFilter,
    setSelectedOperationFilter,

    // Database states
    categories,
    subcategories,
    operationTypes,
    contractTypes,
    billingProfiles,
    calendarRules,
    exemptions,
    promotions,
    tableVersions,
    tables,
    rates,
    packages,
    vehicles,
    contracts,
    drivers,

    // Modals & Forms
    isCatModalOpen,
    setIsCatModalOpen,
    editingCat,
    setEditingCat,
    catForm,
    setCatForm,

    isSubModalOpen,
    setIsSubModalOpen,
    editingSub,
    setEditingSub,
    subForm,
    setSubForm,

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
    editingEx,
    setEditingEx,
    exForm,
    setExForm,

    isPromoModalOpen,
    setIsPromoModalOpen,
    editingPromo,
    setEditingPromo,
    promoForm,
    setPromoForm,

    isCtypeModalOpen,
    setIsCtypeModalOpen,
    editingCtype,
    setEditingCtype,
    ctypeForm,
    setCtypeForm,

    isBprofModalOpen,
    setIsBprofModalOpen,
    editingBprof,
    setEditingBprof,
    bprofForm,
    setBprofForm,

    // Simulator states
    projCategory,
    setProjCategory,
    projSubcategory,
    setProjSubcategory,
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
    handleSaveSubcategory,
    handleDeleteSubcategory,
    handleSaveTable,
    handleDeleteTable,
    handleSaveRate,
    handleDeleteRate,
    handleSaveCal,
    handleFetchHolidays,
    handleSavePackage,
    handleSaveExemption,
    handleSavePromo,
    handleSaveContractType,
    handleDeleteContractType,
    handleSaveBillingProfile,
    handleDeleteBillingProfile,
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
            <span>Pricing & Billing Engine 2.0</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Configure o motor inteligente de precificação e faturamento de diárias, isenções, subcategorias e simulação de ROI por operação.
          </p>
        </div>

        {/* Global Operation Filter */}
        <div className="flex items-center gap-2 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0">
          <Filter className="w-3.5 h-3.5 text-outline" />
          <span className="text-slate-600">Filtrar por Operação:</span>
          <select
            value={selectedOperationFilter}
            onChange={(e) => setSelectedOperationFilter(e.target.value)}
            className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
          >
            <option value="">Todas as Operações</option>
            {operationTypes.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-outline-variant text-xs font-semibold gap-4 overflow-x-auto pb-1">
        {[
          { id: "categories", name: "📋 Categorias & Sub" },
          { id: "contract_types", name: "📄 Tipos de Contrato" },
          { id: "billing_profiles", name: "💳 Perfis de Cobrança" },
          { id: "rates", name: "💲 Tabelas & Tarifas" },
          { id: "calendar", name: "📅 Calendário" },
          { id: "packages", name: "🎁 Pacotes & Isenções" },
          { id: "versioning", name: "🧾 Versionamento" },
          { id: "projections", name: "📈 Projeções" },
          { id: "simulator", name: "⚡ Simulador" }
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
          subcategories={subcategories}
          vehicles={vehicles}
          operationTypes={operationTypes}
          selectedOperationFilter={selectedOperationFilter}
          isCatModalOpen={isCatModalOpen}
          setIsCatModalOpen={setIsCatModalOpen}
          editingCat={editingCat}
          setEditingCat={setEditingCat}
          catForm={catForm}
          setCatForm={setCatForm}
          handleSaveCategory={handleSaveCategory}
          handleDeleteCategory={handleDeleteCategory}
          isSubModalOpen={isSubModalOpen}
          setIsSubModalOpen={setIsSubModalOpen}
          editingSub={editingSub}
          setEditingSub={setEditingSub}
          subForm={subForm}
          setSubForm={setSubForm}
          handleSaveSubcategory={handleSaveSubcategory}
          handleDeleteSubcategory={handleDeleteSubcategory}
        />
      )}

      {!loading && activeTab === "contract_types" && (
        <ContractTypesTab
          contractTypes={contractTypes}
          billingProfiles={billingProfiles}
          operationTypes={operationTypes}
          selectedOperationFilter={selectedOperationFilter}
          isCtypeModalOpen={isCtypeModalOpen}
          setIsCtypeModalOpen={setIsCtypeModalOpen}
          editingCtype={editingCtype}
          setEditingCtype={setEditingCtype}
          ctypeForm={ctypeForm}
          setCtypeForm={setCtypeForm}
          handleSaveContractType={handleSaveContractType}
          handleDeleteContractType={handleDeleteContractType}
        />
      )}

      {!loading && activeTab === "billing_profiles" && (
        <BillingProfilesTab
          billingProfiles={billingProfiles}
          isBprofModalOpen={isBprofModalOpen}
          setIsBprofModalOpen={setIsBprofModalOpen}
          editingBprof={editingBprof}
          setEditingBprof={setEditingBprof}
          bprofForm={bprofForm}
          setBprofForm={setBprofForm}
          handleSaveBillingProfile={handleSaveBillingProfile}
          handleDeleteBillingProfile={handleDeleteBillingProfile}
        />
      )}

      {!loading && activeTab === "rates" && (
        <RatesTab
          rates={rates}
          tables={tables}
          categories={categories}
          subcategories={subcategories}
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
          calendar={calendarRules}
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
            if (confirm("Remover regra do calendário?")) {
              await deleteDocument("calendar_rules", id);
              loadData();
            }
          }}
        />
      )}

      {!loading && activeTab === "packages" && (
        <PackagesTab
          packages={packages}
          exemptions={exemptions}
          promotions={promotions}
          drivers={drivers}
          contracts={contracts}
          vehicles={vehicles}
          categories={categories}
          operationTypes={operationTypes}
          selectedOperationFilter={selectedOperationFilter}
          isPkgModalOpen={isPkgModalOpen}
          setIsPkgModalOpen={setIsPkgModalOpen}
          editingPkg={editingPkg}
          setEditingPkg={setEditingPkg}
          pkgForm={pkgForm}
          setPkgForm={setPkgForm}
          isExModalOpen={isExModalOpen}
          setIsExModalOpen={setIsExModalOpen}
          editingEx={editingEx}
          setEditingEx={setEditingEx}
          exForm={exForm}
          setExForm={setExForm}
          isPromoModalOpen={isPromoModalOpen}
          setIsPromoModalOpen={setIsPromoModalOpen}
          editingPromo={editingPromo}
          setEditingPromo={setEditingPromo}
          promoForm={promoForm}
          setPromoForm={setPromoForm}
          handleSavePackage={handleSavePackage}
          handleSaveExemption={handleSaveExemption}
          handleDeleteExemption={async (id) => {
            if (confirm("Remover isenção comercial?")) {
              await deleteDocument("pricing_exemptions", id);
              loadData();
            }
          }}
          handleSavePromo={handleSavePromo}
          handleDeletePromo={async (id) => {
            if (confirm("Remover campanha de promoção?")) {
              await deleteDocument("pricing_promotions", id);
              loadData();
            }
          }}
        />
      )}

      {!loading && activeTab === "versioning" && (
        <VersioningTab
          tableVersions={tableVersions}
          tables={tables}
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
          contracts={contracts}
          vehicles={vehicles}
          categories={categories}
          subcategories={subcategories}
          tables={tables}
          packages={packages}
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
