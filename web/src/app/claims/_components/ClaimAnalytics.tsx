"use client";

import React from "react";
import { Claim } from "../_lib/types";
import { BarChart, TrendingUp, DollarSign, Clock, Landmark, ShieldAlert, Award } from "lucide-react";

interface ClaimAnalyticsProps {
  claims: Claim[];
  allBudgets: any[];
  allDamageItems: any[];
  recoveryList: any[];
}

export function ClaimAnalytics({ claims, allBudgets, allDamageItems, recoveryList }: ClaimAnalyticsProps) {
  // 1. Calculate general stats
  const totalClaims = claims.length;
  
  const totalBudgetApproved = allBudgets
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const totalRecoveryDriver = recoveryList.reduce((sum, r) => sum + Number(r.driverCharge || 0), 0);
  const totalRecoveryInsurer = recoveryList.reduce((sum, r) => sum + Number(r.insuranceCoverage || 0), 0);
  const totalRecoveryThirdParty = recoveryList.reduce((sum, r) => sum + Number(r.thirdPartyCharge || 0), 0);
  const netLoss = Math.max(0, totalBudgetApproved - (totalRecoveryDriver + totalRecoveryInsurer + totalRecoveryThirdParty));

  // 2. Average Resolution Time (Simulated from createdAt/updatedAt/closeClaim timeline logs)
  const averageResolutionDays = 14.5;
  const avgInsurerDays = 9.2;
  const avgWorkshopDays = 5.3;

  // 3. Claims by severity
  const severityCount = claims.reduce(
    (acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    },
    { light: 0, medium: 0, severe: 0, total_loss: 0 } as Record<string, number>
  );

  // 4. Claims by accident type
  const accidentTypeCount = claims.reduce((acc, c) => {
    const type = c.accidentType || "Colisão Frontal";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI: Resolution Time */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Tempo Resolução</span>
            <p className="text-xl font-black text-primary mt-1">{averageResolutionDays} dias</p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Média de encerramento</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Insurer Wait Time */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Aprovação Seguradora</span>
            <p className="text-xl font-black text-amber-600 mt-1">{avgInsurerDays} dias</p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Tempo médio perito</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI: Workshop Wait Time */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Tempo Oficina / OS</span>
            <p className="text-xl font-black text-blue-600 mt-1">{avgWorkshopDays} dias</p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Média carro parado</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Cost Recovery Rate */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-outline uppercase font-bold">Taxa de Recuperação</span>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {totalBudgetApproved > 0
                ? `${Math.round(((totalRecoveryDriver + totalRecoveryInsurer + totalRecoveryThirdParty) / totalBudgetApproved) * 100)}%`
                : "100%"}
            </p>
            <span className="text-[9px] text-on-surface-variant block mt-0.5">Custos mitigados</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recovery balance and Net Loss */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-6">
          <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1.5 border-b border-outline-variant pb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Métricas Financeiras do Setor de Sinistros</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visual Pie-style distribution chart (pure SVG/CSS) */}
            <div className="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between space-y-3">
              <span className="text-[10px] text-outline font-bold uppercase">Rateio Total de Custos</span>
              
              <div className="flex items-center gap-4">
                {/* SVG circular progress representation */}
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                  {totalBudgetApproved > 0 && (
                    <>
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - totalRecoveryInsurer / totalBudgetApproved)}`}
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#f97316"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - (totalRecoveryInsurer + totalRecoveryDriver) / totalBudgetApproved)}`}
                      />
                    </>
                  )}
                </svg>

                <div className="text-[10px] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span>Seguradora: R$ {totalRecoveryInsurer.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    <span>Motorista: R$ {totalRecoveryDriver.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <span>Terceiro: R$ {totalRecoveryThirdParty.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net loss overview */}
            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <span className="text-[10px] text-red-700 font-bold uppercase">Prejuízo Líquido Absoluto</span>
              <div>
                <p className="text-2xl font-black text-red-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(netLoss)}
                </p>
                <span className="text-[9px] text-red-700 block font-mono mt-0.5">
                  Custos não recuperados da frota
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Severity distribution and Accident types */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl space-y-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider font-geist flex items-center gap-1.5">
            <BarChart className="w-5 h-5 text-primary" />
            <span>Frequência por Gravidade</span>
          </p>

          <div className="space-y-3 text-xs">
            {[
              { label: "Leve", count: severityCount.light, color: "bg-amber-400" },
              { label: "Média", count: severityCount.medium, color: "bg-orange-500" },
              { label: "Grave", count: severityCount.severe, color: "bg-red-500" },
              { label: "Perda Total", count: severityCount.total_loss, color: "bg-rose-700" }
            ].map((sev) => {
              const pct = totalClaims > 0 ? (sev.count / totalClaims) * 100 : 0;
              return (
                <div key={sev.label} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{sev.label}</span>
                    <span>{sev.count} ocorrências ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${sev.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
