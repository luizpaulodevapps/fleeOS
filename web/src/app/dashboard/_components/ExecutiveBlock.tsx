"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ExecutiveBlockProps {
  calculations: any;
  totalMileage: number;
}

export function ExecutiveBlock({ calculations, totalMileage }: ExecutiveBlockProps) {
  return (
    <div className="space-y-stack-lg animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter">
        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Valor da Frota (FIPE)</span>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.totalFipe)}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">Aquisição: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.totalAcquisition)}</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Depreciação Acumulada</span>
          <div className="text-2xl font-black font-geist text-error">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.totalDepreciation)}
          </div>
          <span className="text-[10px] text-error font-medium mt-1 block">-{((calculations.totalDepreciation / Math.max(1, calculations.totalAcquisition)) * 100).toFixed(1)}% do valor de compra</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Financiamentos Abertos</span>
          <div className="text-2xl font-black font-geist text-amber-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.totalFinancingOutstanding)}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">Passivo financeiro</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Patrimônio Líquido</span>
          <div className="text-2xl font-black font-geist text-accent-green">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.patrimonioLiquido)}
          </div>
          <span className="text-[10px] text-accent-green font-medium mt-1 block">FIPE menos financiamentos</span>
        </div>

        <div className="bg-surface-container-lowest p-stack-md border border-outline-variant rounded-xl hover:border-primary transition-all">
          <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">Lucro Líquido Real</span>
          <div className="text-2xl font-black font-geist text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calculations.lucroLiquido)}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">Recebido menos custos</span>
        </div>
      </div>

      {/* BI Ranking Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Top Vehicles */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent-green" />
              Top 3 Veículos (Maior ROI)
            </h3>
            <span className="text-[9px] bg-accent-green/10 text-accent-green px-2 py-0.5 rounded font-black font-mono">Alta Rentabilidade</span>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {calculations.topRoiVehicles.map((veh: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center group cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2">
                <div>
                  <p className="text-xs font-bold text-primary">{veh.brand} {veh.model}</p>
                  <p className="text-[10px] text-on-surface-variant">{veh.plate} • Faturamento: R$ {veh.revenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-accent-green">+{veh.roi.toFixed(1)}%</p>
                  <p className="text-[9px] text-on-surface-variant">ROI acumulado</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Vehicles */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-error" />
              Veículos Críticos (Menor ROI)
            </h3>
            <span className="text-[9px] bg-error/10 text-error px-2 py-0.5 rounded font-black font-mono">Cuidado / Manutenção</span>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {calculations.worstRoiVehicles.map((veh: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center group cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2">
                <div>
                  <p className="text-xs font-bold text-primary">{veh.brand} {veh.model}</p>
                  <p className="text-[10px] text-on-surface-variant">{veh.plate} • Despesas: R$ {veh.cost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-error">{veh.roi.toFixed(1)}%</p>
                  <p className="text-[9px] text-on-surface-variant">Custo/KM: R$ {veh.costPerKm.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Efficiency */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-geist text-xs font-bold uppercase tracking-wider text-primary mb-3">Eficiência da Operação</h3>
            
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant mb-4">
              <div>
                <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Taxa de Ocupação</span>
                <span className="text-2xl font-black font-geist text-primary">{calculations.occupancyRate.toFixed(1)}%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin-slow flex items-center justify-center font-bold text-[10px] text-primary bg-white">
                {calculations.occupancyRate.toFixed(0)}%
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div>
                <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Custo Médio da Frota por KM</span>
                <span className="text-2xl font-black font-geist text-primary">
                  R$ {(calculations.totalMaintCosts / Math.max(1, totalMileage)).toFixed(2)}
                </span>
              </div>
              <span className="material-symbols-outlined text-[32px] text-outline-variant">directions_car</span>
            </div>
          </div>
          
          <p className="text-[9px] text-on-surface-variant leading-relaxed mt-4">
            Calculado com base em {totalMileage.toLocaleString()} km rodados totais e R$ {calculations.totalMaintCosts.toLocaleString()} em manutenções e despesas acumuladas.
          </p>
        </div>
      </div>
    </div>
  );
}
