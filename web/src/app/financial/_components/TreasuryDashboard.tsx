"use client";

import React from "react";
import { AccountsReceivable, FinancialTransaction } from "../_lib/types";
import { DollarSign, Landmark, User, FileSpreadsheet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

interface TreasuryDashboardProps {
  receivables: AccountsReceivable[];
  transactions: FinancialTransaction[];
  drivers: any[];
  movements: any[];
}

export function TreasuryDashboard({ receivables, transactions, drivers, movements }: TreasuryDashboardProps) {
  // 1. Calculations
  const dailyReceipts = movements
    .filter(m => m.type === "RECEIPT")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const monthlyReceipts = dailyReceipts * 25.4; // simulated forecasting

  const openReceivables = receivables
    .filter(r => r.status === "open" || r.status === "overdue")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const totalOverdue = receivables
    .filter(r => r.status === "overdue")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const getDriverName = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.name : "Motorista Desconhecido";
  };

  // Top Debtors
  const debtorMap = receivables
    .filter(r => r.status === "open" || r.status === "overdue")
    .reduce((acc, r) => {
      acc[r.driverId] = (acc[r.driverId] || 0) + (r.amount - r.paidAmount);
      return acc;
    }, {} as Record<string, number>);

  const topDebtors = Object.entries(debtorMap)
    .map(([driverId, amount]) => ({ driverId, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top Payers (approved transactions)
  const payerMap = transactions
    .filter(t => t.status === "approved")
    .reduce((acc, t) => {
      acc[t.driverId] = (acc[t.driverId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topPayers = Object.entries(payerMap)
    .map(([driverId, amount]) => ({ driverId, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI stats dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Receita do Dia</span>
            <p className="text-xl font-black text-primary mt-1">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dailyReceipts)}
            </p>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>Entradas caixa ativas</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Inadimplência Projetada</span>
            <p className="text-xl font-black text-red-600 mt-1">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalOverdue)}
            </p>
            <span className="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowDownRight className="w-3 h-3" />
              <span>Títulos vencidos</span>
            </span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20">
            <Landmark className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Total a Receber</span>
            <p className="text-xl font-black text-primary mt-1">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(openReceivables)}
            </p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Carteira de títulos aberta</span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <FileSpreadsheet className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Previsão Faturamento 30d</span>
            <p className="text-xl font-black text-primary mt-1">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyReceipts)}
            </p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Estimativa linear</span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Lists of top debtors / payers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Debtors */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider font-geist flex items-center gap-1.5 border-b pb-3">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span>Top Inadimplentes (Contas em Aberto)</span>
          </p>

          <div className="divide-y divide-outline-variant/60 text-xs">
            {topDebtors.length === 0 ? (
              <p className="text-center text-outline italic py-6">Nenhuma inadimplência ativa registrada.</p>
            ) : (
              topDebtors.map((debt, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-primary">{getDriverName(debt.driverId)}</span>
                  </div>
                  <span className="font-black text-red-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(debt.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Payers */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider font-geist flex items-center gap-1.5 border-b pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Top Adimplentes / Maiores Lançamentos</span>
          </p>

          <div className="divide-y divide-outline-variant/60 text-xs">
            {topPayers.length === 0 ? (
              <p className="text-center text-outline italic py-6">Nenhum faturamento registrado no período.</p>
            ) : (
              topPayers.map((pay, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-primary">{getDriverName(pay.driverId)}</span>
                  </div>
                  <span className="font-black text-emerald-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pay.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
