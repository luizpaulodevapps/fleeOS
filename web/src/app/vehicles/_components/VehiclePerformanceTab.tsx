"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

interface VehiclePerformanceTabProps {
  selectedVehicle: any;
  computePerformance: (vehicleId: string) => any;
}

export function VehiclePerformanceTab({
  selectedVehicle,
  computePerformance
}: VehiclePerformanceTabProps) {
  const p = computePerformance(selectedVehicle.id);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const fmtN = (v: number, dec = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: dec });

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        Performance Financeira
      </h4>

      {/* Top 3 KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Receita Total</p>
          <p className="text-xl font-black text-emerald-700">{fmt(p.totalRevenue)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{fmtN(p.revenueMonthly)}/mês</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase text-red-600 mb-1">Custos Totais</p>
          <p className="text-xl font-black text-red-700">{fmt(p.totalCost)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{fmtN(p.costMonthly)}/mês</p>
        </div>
        <div className={`${p.profit >= 0 ? "bg-violet-50 border-violet-200" : "bg-orange-50 border-orange-200"} border rounded-xl p-4 text-center`}>
          <p className={`text-[10px] font-bold uppercase mb-1 ${p.profit >= 0 ? "text-violet-600" : "text-orange-600"}`}>Lucro Líquido</p>
          <p className={`text-xl font-black ${p.profit >= 0 ? "text-violet-700" : "text-orange-700"}`}>{fmt(p.profit)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{p.profit >= 0 ? "✅ Positivo" : "⚠️ Negativo"}</p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Indicadores do Ativo</h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: "ROI", value: `${fmtN(p.roi)}%`, ok: p.roi > 0 },
            { label: "Payback", value: p.paybackMonths ? `${Math.round(p.paybackMonths)} meses` : "—", ok: p.paybackMonths !== null },
            { label: "Custo/km", value: p.kmRodado > 0 ? `R$ ${fmtN(p.costPerKm, 2)}/km` : "—", ok: true },
            { label: "Receita/km", value: p.kmRodado > 0 ? `R$ ${fmtN(p.revenuePerKm, 2)}/km` : "—", ok: true },
            { label: "Taxa Ocupação", value: `${fmtN(p.occupationRate)}%`, ok: p.occupationRate > 70 },
            { label: "KM Rodado", value: `${p.kmRodado.toLocaleString("pt-BR")} km`, ok: true }
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
              <span className="text-slate-500 font-semibold">{item.label}</span>
              <span className={`font-bold font-mono ${item.ok ? "text-slate-800" : "text-orange-600"}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Centro de Investimentos */}
      {p.acq && (
        <div className="bg-gradient-to-br from-violet-900 to-slate-900 rounded-xl p-5 text-white">
          <h5 className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-4">💎 Centro de Investimentos</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">Valor de Compra</span>
              <span className="font-bold">{fmt(Number(p.acq.purchaseValue || 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">FIPE Atual</span>
              <span className="font-bold">{p.acq.currentFipeValue ? fmt(Number(p.acq.currentFipeValue)) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Lucro Gerado</span>
              <span className={`font-bold ${p.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p.profit >= 0 ? "+" : ""}{fmt(p.profit)}</span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between">
              <span className="font-bold">Resultado Total</span>
              <span className={`font-black text-base ${p.totalResult >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {p.totalResult >= 0 ? "+" : ""}{fmt(p.totalResult)}
              </span>
            </div>
          </div>
          <div className={`mt-4 text-center text-xs font-bold py-2 rounded-lg ${
            p.totalResult >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
          }`}>
            {p.totalResult >= 0 ? "✅ INVESTIMENTO POSITIVO" : "⚠️ REVEJA A ESTRATÉGIA"}
          </div>
        </div>
      )}

      {/* Composição de custos */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Composição de Custos</h5>
        <div className="space-y-2 text-xs">
          {[
            { label: "Manutenção", value: p.totalMaintCost },
            { label: "Sinistros/Avarias", value: p.totalIncidentCost },
            { label: "Seguro + IPVA (proporcional)", value: p.fixedCosts },
            { label: "Financiamento (pago)", value: p.paidInstallments }
          ].filter(i => i.value > 0).map(item => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-mono font-bold text-slate-700">{fmt(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
