"use client";

import React from "react";
import { FileText, Printer } from "lucide-react";
import { useReports } from "./_hooks/useReports";
import { OverviewTab } from "./_components/OverviewTab";
import { FinancialTab } from "./_components/FinancialTab";
import { OperationalTab } from "./_components/OperationalTab";
import { AlertsTab } from "./_components/AlertsTab";

export default function ReportsManager() {
  const {
    loading,
    activeTab,
    setActiveTab,
    
    // Stats & lists
    overviewMetrics,
    filteredAlerts,
    categoryPerformance,
    maintenanceBreakdown,
    filteredVehicles,

    // Inputs & setters
    alertSearchTerm,
    setAlertSearchTerm,
    alertTypeFilter,
    setAlertTypeFilter,
    vehicleSearchTerm,
    setVehicleSearchTerm,
    vehicleStatusFilter,
    setVehicleStatusFilter
  } = useReports();

  if (loading) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl max-w-6xl mx-auto">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant text-xs font-semibold">Consolidando relatórios analíticos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Breadcrumbs (Hidden on print) */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs print:hidden">
        <span className="hover:text-primary cursor-pointer" onClick={() => setActiveTab("overview")}>Relatórios</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">
          {activeTab === "overview" && "Visão Geral"}
          {activeTab === "financial" && "Relatório Financeiro"}
          {activeTab === "operational" && "Relatório Operacional"}
          {activeTab === "alerts" && "Fila de Alertas"}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-geist print:text-black">
            Relatórios e Auditoria
          </h1>
          <p className="text-on-surface-variant text-xs mt-1 print:text-gray-600">
            Painel consolidado contendo análise financeira de ROI, ocupação de frotas, manutenção preventiva e regulação de alertas.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-xs print:hidden shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* Tabs Menu (Hidden on print) */}
      <div className="flex border-b border-outline-variant text-xs font-semibold gap-4 overflow-x-auto pb-1 print:hidden">
        {[
          { id: "overview", name: "📈 Visão Geral" },
          { id: "financial", name: "💰 Financeiro & ROI" },
          { id: "operational", name: "🔧 Operações & Frota" },
          { id: "alerts", name: "⚠️ Alertas Regulatórios" }
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

      {/* Active Tab Renders */}
      <main className="min-h-[400px]">
        {activeTab === "overview" && (
          <OverviewTab metrics={overviewMetrics} />
        )}

        {activeTab === "financial" && (
          <FinancialTab categories={categoryPerformance} />
        )}

        {activeTab === "operational" && (
          <OperationalTab 
            maintenanceBreakdown={maintenanceBreakdown}
            filteredVehicles={filteredVehicles}
            vehicleSearchTerm={vehicleSearchTerm}
            setVehicleSearchTerm={setVehicleSearchTerm}
            vehicleStatusFilter={vehicleStatusFilter}
            setVehicleStatusFilter={setVehicleStatusFilter}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsTab 
            alerts={filteredAlerts}
            alertSearchTerm={alertSearchTerm}
            setAlertSearchTerm={setAlertSearchTerm}
            alertTypeFilter={alertTypeFilter}
            setAlertTypeFilter={setAlertTypeFilter}
          />
        )}
      </main>

      {/* Printable Footer (Visible only on print) */}
      <div className="hidden print:block border-t border-gray-300 pt-8 mt-12 text-center text-[10px] text-gray-500">
        <p className="font-bold">FleetOS - Controle de Operações de Frotas</p>
        <p className="mt-1">Documento gerado automaticamente em {new Date().toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}
