"use client";

import React from "react";
import { CategoryPerformance } from "../_lib/types";
import { DollarSign, ShieldAlert, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface FinancialTabProps {
  categories: CategoryPerformance[];
}

export function FinancialTab({ categories }: FinancialTabProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const totalMonthlyProj = categories.reduce((sum, c) => sum + c.monthlyRevenue, 0);
  const totalMaintCost = categories.reduce((sum, c) => sum + c.maintenanceCost, 0);
  const totalRoi = totalMonthlyProj - totalMaintCost;

  return (
    <div className="space-y-6">
      {/* Financial ROI Overview Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Projeção Mensal de Faturamento (30 dias)</h3>
          <p className="text-3xl font-black font-geist mt-1 text-white">{formatCurrency(totalMonthlyProj)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Calculado a partir de diárias de contratos ativos.</p>
        </div>

        <div className="flex gap-6">
          <div className="border-l border-slate-800 pl-6 space-y-0.5">
            <span className="block text-[9px] font-bold uppercase text-slate-400">Despesa Oficina</span>
            <p className="text-sm font-black text-rose-400">{formatCurrency(totalMaintCost)}</p>
          </div>
          <div className="border-l border-slate-800 pl-6 space-y-0.5">
            <span className="block text-[9px] font-bold uppercase text-slate-400">ROI Líquido Estimado</span>
            <p className={`text-sm font-black ${totalRoi >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(totalRoi)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-slate-50 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Desempenho Financeiro por Categoria</h4>
            <p className="text-[10px] text-on-surface-variant">Detalhamento de ROI e taxa de ocupação de ativos.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-outline">Categoria</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-outline text-center">Utilização</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-outline text-right">Projeção Receita (Mensal)</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-outline text-right">Custos Manutenção</th>
                <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-outline text-right">ROI Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant italic">
                    Nenhuma categoria registrada no sistema.
                  </td>
                </tr>
              ) : (
                categories.map((c) => {
                  const hasProf = c.roi >= 0;
                  return (
                    <tr key={c.categoryId} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary text-sm">{c.categoryName}</span>
                        <span className="block text-[10px] text-on-surface-variant font-medium mt-0.5">
                          {c.activeVehicles} de {c.totalVehicles} carros ativos
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-outline-variant/40">
                            <div style={{ width: `${c.utilizationRate}%` }} className="bg-primary h-full rounded-full" />
                          </div>
                          <span className="font-mono font-bold text-primary">{c.utilizationRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">
                        {formatCurrency(c.monthlyRevenue)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-600">
                        {formatCurrency(c.maintenanceCost)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className={`font-bold ${hasProf ? "text-emerald-600" : "text-rose-600"} text-sm`}>
                            {formatCurrency(c.roi)}
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-bold gap-0.5 ${hasProf ? "text-emerald-650" : "text-rose-650"}`}>
                            {hasProf ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {c.monthlyRevenue > 0 ? `${((c.roi / c.monthlyRevenue) * 100).toFixed(0)}% margem` : "0% margem"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
