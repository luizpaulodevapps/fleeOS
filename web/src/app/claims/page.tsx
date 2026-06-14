"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Plus, LayoutDashboard, FileSpreadsheet, AlertTriangle, Key, Landmark, Scale, BarChart3 } from "lucide-react";

// Hooks
import { useClaims } from "./_hooks/useClaims";

// Components
import { ClaimsTable } from "./_components/ClaimsTable";
import { ClaimWizard } from "./_components/ClaimWizard";
import { ClaimDossier } from "./_components/ClaimDossier";
import { ClaimDashboard } from "./_components/ClaimDashboard";
import { ClaimAnalytics } from "./_components/ClaimAnalytics";
import { ClaimReserveVehicle } from "./_components/ClaimReserveVehicle";

export default function ClaimsManager() {
  const { can, currentUser } = useAuth();
  
  // Custom Hook
  const {
    claims,
    drivers,
    vehicles,
    contracts,
    priceTable,
    checklists,
    evidences,
    damageItems,
    budgets,
    installments,
    approvals,
    
    // 2.0 properties & operations
    policeReport,
    insuranceDetails,
    financialRecovery,
    timelineEvents,
    savePoliceReportDetails,
    saveInsuranceDetails,
    saveFinancialRecoveryDetails,
    addTimelineEvent,

    // 2.0 digital dossier
    claimAuditLogs,
    claimEvidenceChain,
    claimRiskAnalysis,
    claimVersions,
    claimRecoveryCase,
    updateClaimFields,
    saveClaimVersion,
    saveOcorrenciaDetails,
    saveJuridicoDetails,

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
    closeClaim,
    loadClaimSubCollections
  } = useClaims();

  // Active top-level tab
  const [navTab, setNavTab] = useState("dashboard");

  // Page States for filtering (for ClaimsTable)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

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

  // If a claim is selected, display its Dossier view overriding the tab list
  if (selectedClaim) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <ClaimDossier
          claim={selectedClaim}
          onBack={() => setSelectedClaim(null)}
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
          policeReport={policeReport}
          insuranceDetails={insuranceDetails}
          financialRecovery={financialRecovery}
          timelineEvents={timelineEvents}
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
          savePoliceReportDetails={savePoliceReportDetails}
          saveInsuranceDetails={saveInsuranceDetails}
          saveFinancialRecoveryDetails={saveFinancialRecoveryDetails}

          // 2.0 digital dossier props
          claimAuditLogs={claimAuditLogs}
          claimEvidenceChain={claimEvidenceChain}
          claimRiskAnalysis={claimRiskAnalysis}
          claimVersions={claimVersions}
          claimRecoveryCase={claimRecoveryCase}
          updateClaimFields={updateClaimFields}
          saveClaimVersion={saveClaimVersion}
          saveOcorrenciaDetails={saveOcorrenciaDetails}
          saveJuridicoDetails={saveJuridicoDetails}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
        <span className="hover:text-primary cursor-pointer">Operações</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Central de Sinistros 2.0</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span>Central de Sinistros 2.0</span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">
            Controle de ponta a ponta: do registro da colisão ao BO, checklists de fotos, estimativa de danos, orçamentos, aprovações de diretoria e parcelamento no extrato.
          </p>
        </div>
        {can("claims.edit") && navTab !== "wizard" && (
          <button
            onClick={() => setNavTab("wizard")}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Novo Sinistro</span>
          </button>
        )}
      </div>

      {/* Top level subnavigation tabs */}
      {navTab !== "wizard" && (
        <div className="flex overflow-x-auto text-[11px] font-bold border-b border-outline-variant bg-slate-50 rounded-lg shadow-sm">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "active", label: "Sinistros Ativos", icon: FileSpreadsheet },
            { id: "oficina", label: "Oficina & Reserva", icon: Key },
            { id: "seguradoras", label: "Seguradoras", icon: Landmark },
            { id: "recovery", label: "Recuperação Financeira", icon: Scale },
            { id: "relatorios", label: "Relatórios", icon: BarChart3 }
          ].map((item) => {
            const Icon = item.icon;
            const isAct = navTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setNavTab(item.id)}
                className={`flex items-center space-x-1.5 px-5 py-3 border-b-2 transition-all uppercase tracking-wider shrink-0 ${
                  isAct
                    ? "border-primary text-primary bg-white font-extrabold"
                    : "border-transparent text-on-surface-variant hover:text-primary hover:bg-white/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Tab content layout */}
      <div className="text-xs">
        {navTab === "dashboard" && (
          <ClaimDashboard
            claims={claims}
            activeClaimsCount={activeClaimsCount}
            repairingClaimsCount={repairingClaimsCount}
            closedClaimsCount={closedClaimsCount}
            totalDamageCost={totalDamageCost}
            getDriverName={getDriverName}
            getVehiclePlate={getVehiclePlate}
            onSelectClaim={(c) => {
              setSelectedClaim(c);
              setActiveTab("summary");
            }}
          />
        )}

        {navTab === "wizard" && (
          <ClaimWizard
            drivers={drivers}
            vehicles={vehicles}
            contracts={contracts}
            onSubmit={createClaim}
            onCancel={() => setNavTab("dashboard")}
          />
        )}

        {navTab === "active" && (
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
            onSelectClaim={(c) => {
              setSelectedClaim(c);
              setActiveTab("details");
            }}
          />
        )}

        {navTab === "oficina" && (
          <div className="space-y-6">
            <ClaimReserveVehicle
              claims={claims}
              vehicles={vehicles}
              drivers={drivers}
              onReload={async () => {
                // simple reload data
              }}
              updateClaim={async (id, payload) => {
                // mock updater of reserve details
                await saveInsuranceDetails(id, payload as any);
              }}
            />
          </div>
        )}

        {navTab === "seguradoras" && (
          <div className="bg-white border border-outline-variant p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5 border-b pb-3">
              <Landmark className="w-5 h-5 text-primary" />
              <span>Acompanhamento de Sinistros Seguradoras</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant text-[10px] text-outline font-bold uppercase">
                    <th className="py-2.5">Nº Sinistro</th>
                    <th className="py-2.5">Placa</th>
                    <th className="py-2.5">Condutor</th>
                    <th className="py-2.5">Expectativa de Pagamento</th>
                    <th className="py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-outline italic">Sem sinistros sob acompanhamento securitário.</td>
                    </tr>
                  ) : (
                    claims.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-primary">{c.claimNumber}</td>
                        <td className="py-3 font-mono">{getVehiclePlate(c.vehicleId)}</td>
                        <td className="py-3">{getDriverName(c.driverId)}</td>
                        <td className="py-3 font-mono">15/07/2026 (Previsão)</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedClaim(c);
                              setActiveTab("insurance");
                            }}
                            className="px-3 py-1 bg-primary text-on-primary font-bold rounded text-[10px]"
                          >
                            Editar Seguradora
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {navTab === "recovery" && (
          <div className="bg-white border border-outline-variant p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-primary font-geist flex items-center gap-1.5 border-b pb-3">
              <Scale className="w-5 h-5 text-primary" />
              <span>Acompanhamento de Recuperação Financeira</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant text-[10px] text-outline font-bold uppercase">
                    <th className="py-2.5">Nº Sinistro</th>
                    <th className="py-2.5">Condutor</th>
                    <th className="py-2.5">Responsável Principal</th>
                    <th className="py-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-outline italic">Sem registros financeiros vinculados.</td>
                    </tr>
                  ) : (
                    claims.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-primary">{c.claimNumber}</td>
                        <td className="py-3">{getDriverName(c.driverId)}</td>
                        <td className="py-3 font-semibold text-orange-600">Motorista (Franquia)</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedClaim(c);
                              setActiveTab("recovery");
                            }}
                            className="px-3 py-1 bg-primary text-on-primary font-bold rounded text-[10px]"
                          >
                            Editar Rateio
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {navTab === "relatorios" && (
          <ClaimAnalytics
            claims={claims}
            allBudgets={budgets}
            allDamageItems={damageItems}
            recoveryList={financialRecovery ? [financialRecovery] : []}
          />
        )}
      </div>
    </div>
  );
}
