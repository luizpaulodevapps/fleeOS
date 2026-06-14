"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFinancialHub } from "./_hooks/useFinancialHub";
import { TreasuryDashboard } from "./_components/TreasuryDashboard";
import { CashierConsole } from "./_components/CashierConsole";
import { ReconciliationConsole } from "./_components/ReconciliationConsole";
import { CollectionsEngine } from "./_components/CollectionsEngine";
import { ComplianceConsole } from "./_components/ComplianceConsole";

import { 
  Plus, 
  X, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  FileCheck, 
  Layers, 
  ShieldCheck, 
  Scale 
} from "lucide-react";

function FinancialPageContent() {
  const { can } = useAuth();
  const hub = useFinancialHub();
  
  // Navigation Tabs
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"dashboard" | "cashier" | "reconciliation" | "collections" | "compliance">("dashboard");

  useEffect(() => {
    if (tabParam && ["dashboard", "cashier", "reconciliation", "collections", "compliance"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Adjustment Request Modal
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjData, setAdjData] = useState({
    driverId: "",
    amount: "",
    reason: ""
  });

  const handleRequestAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(adjData.amount);
    if (!adjData.driverId || isNaN(amt) || amt === 0 || !adjData.reason) {
      alert("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    await hub.requestAdjustment(adjData.driverId, amt, adjData.reason);
    setIsAdjModalOpen(false);
    setAdjData({ driverId: "", amount: "", reason: "" });
    alert("Solicitação de ajuste de saldo enviada para a fila de compliance/auditoria.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-xs text-on-surface">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-[11px]">
        <span className="hover:text-primary cursor-pointer font-medium">Financeiro</span>
        <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
        <span className="text-primary font-bold">Financial Hub</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary font-geist">
            Financial Hub & Central Anti-Fraude
          </h1>
          <p className="text-on-surface-variant text-[11px] mt-1.5">
            Cockpit unificado de contas a receber, faturamento de motoristas, controle de turno de caixa, conciliação e compliance.
          </p>
        </div>
        
        {can("driver_ledger.edit") && (
          <button
            onClick={() => {
              setAdjData({ driverId: hub.drivers[0]?.id || "", amount: "", reason: "" });
              setIsAdjModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-extrabold hover:opacity-90 transition-all text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar Ajuste Manual</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-outline-variant overflow-x-auto space-x-1.5 pb-0.5">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center space-x-1.5 px-4 py-3 font-bold border-b-2 text-xs transition-all whitespace-nowrap ${
            activeTab === "dashboard"
              ? "border-primary text-primary"
              : "border-transparent text-outline hover:text-primary hover:border-outline-variant"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Executivo</span>
        </button>

        <button
          onClick={() => setActiveTab("cashier")}
          className={`flex items-center space-x-1.5 px-4 py-3 font-bold border-b-2 text-xs transition-all whitespace-nowrap ${
            activeTab === "cashier"
              ? "border-primary text-primary"
              : "border-transparent text-outline hover:text-primary hover:border-outline-variant"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Caixa Operacional</span>
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={`flex items-center space-x-1.5 px-4 py-3 font-bold border-b-2 text-xs transition-all whitespace-nowrap ${
            activeTab === "reconciliation"
              ? "border-primary text-primary"
              : "border-transparent text-outline hover:text-primary hover:border-outline-variant"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Conciliação Bancária</span>
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center space-x-1.5 px-4 py-3 font-bold border-b-2 text-xs transition-all whitespace-nowrap ${
            activeTab === "collections"
              ? "border-primary text-primary"
              : "border-transparent text-outline hover:text-primary hover:border-outline-variant"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cobrança & Acordos</span>
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center space-x-1.5 px-4 py-3 font-bold border-b-2 text-xs transition-all whitespace-nowrap ${
            activeTab === "compliance"
              ? "border-primary text-primary"
              : "border-transparent text-outline hover:text-primary hover:border-outline-variant"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoria & Compliance</span>
        </button>
      </div>

      {/* Main Tab views */}
      {hub.loading ? (
        <div className="p-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
          <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-bold text-xs">Carregando dados consolidados do Financial Hub...</p>
        </div>
      ) : (
        <div className="pt-2 animate-in fade-in duration-300">
          {activeTab === "dashboard" && (
            <TreasuryDashboard 
              receivables={hub.receivables} 
              transactions={hub.transactions} 
              drivers={hub.drivers}
              movements={hub.movements}
            />
          )}

          {activeTab === "cashier" && (
            <CashierConsole 
              activeSession={hub.activeSession}
              sessions={hub.sessions}
              movements={hub.movements}
              drivers={hub.drivers}
              contracts={hub.contracts}
              receivables={hub.receivables}
              transactions={hub.transactions}
              withdrawalRequests={hub.withdrawalRequests}
              vehicles={hub.vehicles}
              ledger={hub.ledger}
              openCashier={hub.openCashier}
              closeCashier={hub.closeCashier}
              createAR={hub.createAR}
              submitTransaction={hub.submitTransaction}
              webhookApproveTransaction={hub.webhookApproveTransaction}
              voidTransaction={hub.voidTransaction}
              requestWithdrawal={hub.requestWithdrawal}
              approveWithdrawal={hub.approveWithdrawal}
              getDriverCreditScore={hub.getDriverCreditScore}
              reload={hub.reload}
            />
          )}

          {activeTab === "reconciliation" && (
            <ReconciliationConsole 
              transactions={hub.transactions}
              drivers={hub.drivers}
              reload={hub.reload}
            />
          )}

          {activeTab === "collections" && (
            <CollectionsEngine 
              receivables={hub.receivables}
              drivers={hub.drivers}
              paymentPlans={hub.paymentPlans}
              settlements={hub.settlements}
              reload={hub.reload}
            />
          )}

          {activeTab === "compliance" && (
            <ComplianceConsole 
              transactions={hub.transactions}
              adjustments={hub.adjustments}
              incidents={hub.incidents}
              drivers={hub.drivers}
              approveAdjustment={hub.approveAdjustment}
              getDriverCreditScore={hub.getDriverCreditScore}
              reload={hub.reload}
            />
          )}
        </div>
      )}

      {/* REQUEST MANUAL BALANCE ADJUSTMENT MODAL */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-outline-variant rounded-xl shadow-2xl relative overflow-hidden">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-primary font-geist uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-5 h-5 text-primary" />
                  <span>Solicitar Ajuste Manual de Saldo</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Requer autorização em duas etapas por compliance.</p>
              </div>
              <button
                onClick={() => setIsAdjModalOpen(false)}
                className="p-1.5 rounded hover:bg-surface-container"
              >
                <X className="w-4 h-4 text-outline" />
              </button>
            </div>

            <form onSubmit={handleRequestAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Motorista Beneficiário / Devedor</label>
                <select
                  required
                  value={adjData.driverId}
                  onChange={(e) => setAdjData({ ...adjData, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                >
                  <option value="">Selecione o motorista</option>
                  {hub.drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Valor do Ajuste (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-outline">R$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 150.00 para crédito, -100.00 para débito"
                    value={adjData.amount}
                    onChange={(e) => setAdjData({ ...adjData, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-bold outline-none"
                  />
                </div>
                <span className="text-[9px] text-outline mt-1 block">Insira um valor positivo para adicionar crédito, ou negativo para lançar débito.</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1.5">Justificativa Operacional / Auditoria</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explique o motivo deste ajuste de saldo (ex: correção de diária duplicada)"
                  value={adjData.reason}
                  onChange={(e) => setAdjData({ ...adjData, reason: e.target.value })}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-outline-variant rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90"
                >
                  Solicitar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function FinancialPage() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
        <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant font-bold text-xs">Carregando dados consolidados do Financial Hub...</p>
      </div>
    }>
      <FinancialPageContent />
    </Suspense>
  );
}
